"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SEPay } from "@/lib/sepay";
import { calculatePlatformFee } from "@/lib/vnpay/config";
import { z } from "zod";

export const createBookingPaymentSchema = z.object({
    childId: z.string().min(1),
    tutorId: z.string().min(1),
    scheduledDates: z.array(z.date()).min(1),
    timeSlot: z.string().min(1),
    durationMinutes: z.number().min(60).max(180),
    notes: z.string().optional(),
});

export type CreateBookingPaymentInput = z.infer<typeof createBookingPaymentSchema>;

/**
 * Tạo pending bookings và redirect đến payment gateway
 */
export async function createBookingPayment(input: CreateBookingPaymentInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Vui lòng đăng nhập" };
        }

        // Validate input
        const validated = createBookingPaymentSchema.parse(input);

        // Verify child belongs to user
        const child = await prisma.child.findFirst({
            where: {
                id: validated.childId,
                userId: session.user.id,
            },
        });

        if (!child) {
            return { success: false, error: "Không tìm thấy thông tin con" };
        }

        // Get tutor info
        const tutor = await prisma.tutor.findUnique({
            where: { id: validated.tutorId },
        });

        if (!tutor) {
            return { success: false, error: "Không tìm thấy gia sư" };
        }

        // Calculate total amount
        const amountPerSession = (tutor.hourlyRate * validated.durationMinutes) / 60;
        const totalAmount = amountPerSession * validated.scheduledDates.length;
        const platformFee = calculatePlatformFee(totalAmount);

        // Parse time slot
        const [hours, minutes] = validated.timeSlot.split(":").map(Number);

        // Create pending bookings
        const bookings = await Promise.all(
            validated.scheduledDates.map((date) => {
                const scheduledAt = new Date(date);
                scheduledAt.setHours(hours, minutes, 0, 0);

                return prisma.booking.create({
                    data: {
                        childId: validated.childId,
                        tutorId: validated.tutorId,
                        scheduledAt,
                        durationMinutes: validated.durationMinutes,
                        totalAmount: Math.round(amountPerSession),
                        platformFee: Math.round(platformFee / validated.scheduledDates.length),
                        status: "PENDING_PAYMENT", // New status for unpaid bookings
                        notes: validated.notes || null,
                    },
                });
            })
        );

        // Create payment order ID
        const orderId = `BOOK${session.user.id}${Date.now()}`;

        // Store payment info for webhook verification
        await prisma.bookingPayment.create({
            data: {
                orderId,
                userId: session.user.id,
                bookingIds: bookings.map(b => b.id),
                totalAmount: Math.round(totalAmount),
                status: "PENDING",
            },
        });

        // Initialize SEPay with booking-specific return URL
        const sepay = new SEPay({
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/bookings/payment/return`
        });

        // Build payment URL
        const paymentUrl = sepay.buildPaymentUrl({
            amount: Math.round(totalAmount),
            orderId,
            orderInfo: `Thanh toán ${bookings.length} buổi học - ${child.name}`,
            ipAddr: (await headers()).get("x-forwarded-for") || "127.0.0.1",
        });

        return {
            success: true,
            paymentUrl,
            orderId,
            bookingIds: bookings.map(b => b.id),
        };
    } catch (error: any) {
        console.error("Create booking payment error:", error);
        return {
            success: false,
            error: error.message || "Có lỗi xảy ra khi tạo thanh toán",
        };
    }
}

/**
 * Xác nhận thanh toán thành công và activate bookings
 */
export async function confirmBookingPayment(orderId: string, transactionId: string) {
    try {
        // Get payment info
        const payment = await prisma.bookingPayment.findUnique({
            where: { orderId },
        });

        if (!payment) {
            throw new Error("Không tìm thấy thông tin thanh toán");
        }

        if (payment.status === "COMPLETED") {
            return { success: true, message: "Thanh toán đã được xác nhận trước đó" };
        }

        // Update payment status
        await prisma.bookingPayment.update({
            where: { orderId },
            data: {
                status: "COMPLETED",
                transactionId,
                completedAt: new Date(),
            },
        });

        // Update all bookings to PENDING (waiting for tutor confirmation)
        await prisma.booking.updateMany({
            where: {
                id: { in: payment.bookingIds },
            },
            data: {
                status: "PENDING",
            },
        });

        return {
            success: true,
            message: "Thanh toán thành công! Đang chờ gia sư xác nhận.",
        };
    } catch (error: any) {
        console.error("Confirm payment error:", error);
        return {
            success: false,
            error: error.message || "Có lỗi xảy ra",
        };
    }
}

/**
 * Cancel bookings if payment failed
 */
export async function cancelBookingPayment(orderId: string) {
    try {
        const payment = await prisma.bookingPayment.findUnique({
            where: { orderId },
        });

        if (!payment) {
            return { success: false, error: "Không tìm thấy thông tin thanh toán" };
        }

        // Update payment status
        await prisma.bookingPayment.update({
            where: { orderId },
            data: {
                status: "CANCELLED",
            },
        });

        // Delete or cancel bookings
        await prisma.booking.updateMany({
            where: {
                id: { in: payment.bookingIds },
            },
            data: {
                status: "CANCELLED",
            },
        });

        return { success: true };
    } catch (error: any) {
        console.error("Cancel payment error:", error);
        return { success: false, error: error.message };
    }
}

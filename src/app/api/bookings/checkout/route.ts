import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

const checkoutSchema = z.object({
    childId: z.string(),
    tutorId: z.string(),
    scheduledDates: z.array(z.string().transform((val) => new Date(val))),
    timeSlot: z.string(),
    durationMinutes: z.number(),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await requireAuth();
        const body = await req.json();
        const validated = checkoutSchema.parse(body);

        // Verify child belongs to user
        const child = await prisma.child.findFirst({
            where: {
                id: validated.childId,
                userId: session.user.id,
            },
        });

        if (!child) {
            return NextResponse.json(
                { error: "Không tìm thấy thông tin con" },
                { status: 404 }
            );
        }

        // Get tutor info
        const tutor = await prisma.tutor.findUnique({
            where: { id: validated.tutorId },
        });

        if (!tutor) {
            return NextResponse.json(
                { error: "Không tìm thấy gia sư" },
                { status: 404 }
            );
        }

        // Calculate total amount
        const amountPerSession = (tutor.hourlyRate * validated.durationMinutes) / 60;
        const totalAmount = Math.round(amountPerSession * validated.scheduledDates.length);

        // Parse time slot
        const [hours, minutes] = validated.timeSlot.split(":").map(Number);

        // Create unique order ID first
        const cleanUserId = session.user.id.replace(/[^a-zA-Z0-9]/g, '');
        const orderId = `BOOK${cleanUserId}${Date.now()}`;

        // Create payment record first
        const payment = await prisma.bookingPayment.create({
            data: {
                orderId,
                userId: session.user.id,
                bookingIds: [], // Will update after creating bookings
                totalAmount: 5000,
                status: "PENDING",
            },
        });

        // Create pending bookings and link to payment
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
                        platformFee: 0, // Will be calculated on confirmation
                        status: "PENDING_PAYMENT",
                        notes: validated.notes || null,
                        paymentId: payment.id,
                    },
                });
            })
        );

        // Update payment with booking IDs
        await prisma.bookingPayment.update({
            where: { id: payment.id },
            data: {
                bookingIds: bookings.map(b => b.id),
            },
        });

        console.log("💳 Created booking payment order:", {
            orderId,
            userId: session.user.id,
            bookingCount: bookings.length,
            totalAmount,
        });

        // Build QR code URL
        const bankAccount = process.env.SO_TAI_KHOAN || "";
        const bankName = process.env.NGAN_HANG || "";
        const description = orderId;

        const qrCodeUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${totalAmount}&des=${description}`;

        return NextResponse.json({
            orderId,
            amount: totalAmount,
            qrCodeUrl,
            bankAccount,
            bankName,
            description,
            bookingCount: bookings.length,
            bookingIds: bookings.map(b => b.id),
            childName: child.name,
            tutorName: tutor.user?.name || "Gia sư",
            durationMinutes: validated.durationMinutes,
            amountPerSession: Math.round(amountPerSession),
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        console.error("Booking checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create booking payment" },
            { status: 500 }
        );
    }
}

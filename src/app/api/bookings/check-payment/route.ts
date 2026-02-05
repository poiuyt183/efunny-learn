import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

/**
 * Check booking payment status
 * Client polls this endpoint to check if payment is successful
 */
export async function GET(req: Request) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Get payment info
        const payment = await prisma.bookingPayment.findFirst({
            where: {
                orderId,
                userId: session.user.id,
            },
            include: {
                bookings: {
                    include: {
                        child: true,
                        tutor: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            orderId: payment.orderId,
            status: payment.status,
            amount: payment.totalAmount,
            completedAt: payment.completedAt,
            bookingCount: payment.bookingIds.length,
            bookings: payment.bookings?.map(booking => ({
                id: booking.id,
                scheduledAt: booking.scheduledAt,
                status: booking.status,
                childName: booking.child.name,
                tutorName: booking.tutor.user?.name,
            })),
        });
    } catch (error) {
        console.error("Check booking payment error:", error);
        return NextResponse.json(
            { error: "Failed to check payment status" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import db from "@/lib/db";

/**
 * Check payment status
 * Client sẽ poll endpoint này để check xem payment đã success chưa
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

        // Kiểm tra payment history
        const payment = await db.paymentHistory.findFirst({
            where: {
                vnpayOrderId: orderId,
                userId: session.user.id,
            },
        });

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        // Kiểm tra subscription nếu payment thành công
        let subscription = null;
        if (payment.status === "SUCCESS") {
            subscription = await db.subscription.findUnique({
                where: { userId: session.user.id },
            });
        }

        return NextResponse.json({
            orderId: payment.vnpayOrderId,
            status: payment.status,
            amount: payment.amount,
            tier: payment.tier,
            paidAt: payment.paidAt,
            subscription,
        });
    } catch (error) {
        console.error("Check payment error:", error);
        return NextResponse.json(
            { error: "Failed to check payment status" },
            { status: 500 }
        );
    }
}

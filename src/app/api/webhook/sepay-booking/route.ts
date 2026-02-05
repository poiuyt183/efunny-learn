import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { confirmBookingPayment } from "@/features/bookings/actions/payment-actions";

/**
 * SEPay Webhook cho Booking Payments
 * Nhận thông báo từ SEPay khi thanh toán booking thành công
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("📨 SEPay booking webhook received:", body);

        const {
            content,
            transferAmount,
            gateway,
            transactionDate,
            referenceCode,
            id: transactionId
        } = body;

        if (!content || !transferAmount) {
            console.error("❌ Missing required fields from SEPay webhook");
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Extract order ID từ content
        // Format: xxx-xxx-BOOKuseridtimestamp
        const contentParts = content.split('-');
        const orderId = contentParts[contentParts.length - 1];

        // Verify order ID format
        if (!orderId.startsWith('BOOK')) {
            console.log("⚠️ Not a booking payment, skipping");
            return NextResponse.json({ success: true, message: "Not a booking payment" });
        }

        console.log(`💰 Processing booking payment: ${orderId}`);

        // Get payment from database
        const payment = await prisma.bookingPayment.findUnique({
            where: { orderId },
        });

        if (!payment) {
            console.error("❌ Payment not found:", orderId);
            return NextResponse.json(
                { success: false, message: "Payment not found" },
                { status: 404 }
            );
        }

        // Check if already processed
        if (payment.status === 'COMPLETED') {
            console.log("✅ Payment already processed");
            return NextResponse.json({
                success: true,
                message: "Payment already processed"
            });
        }

        // Verify amount
        if (transferAmount < payment.totalAmount) {
            console.error("❌ Amount mismatch:", {
                expected: payment.totalAmount,
                received: transferAmount
            });
            return NextResponse.json(
                { success: false, message: "Amount mismatch" },
                { status: 400 }
            );
        }

        // Confirm payment
        const result = await confirmBookingPayment(orderId, transactionId.toString());

        if (!result.success) {
            console.error("❌ Failed to confirm payment:", result.error);
            return NextResponse.json(
                { success: false, message: result.error },
                { status: 500 }
            );
        }

        console.log("✅ Booking payment confirmed successfully");

        return NextResponse.json({
            success: true,
            message: "Payment confirmed",
            orderId,
            bookingIds: payment.bookingIds
        });

    } catch (error: any) {
        console.error("❌ Booking webhook error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint for testing
export async function GET() {
    return NextResponse.json({
        service: "SEPay Booking Webhook",
        status: "active",
        endpoint: "/api/webhook/sepay-booking"
    });
}

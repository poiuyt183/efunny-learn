import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * SEPay Webhook Endpoint
 * Nhận thông báo từ SEPay khi thanh toán thành công
 * 
 * Cấu hình webhook URL trong SEPay dashboard:
 * https://your-domain.com/api/webhook/sepay
 */
export async function POST(req: Request) {
    try {
        // Parse webhook data từ SEPay
        const body = await req.json();

        console.log("📨 SEPay webhook received:", body);

        // SEPay webhook format:
        // {
        //   gateway: 'TPBank',
        //   transactionDate: '2026-02-04 15:35:44',
        //   accountNumber: '19820041803',
        //   content: '117047966275-0918707142-SUBSfLScdV1o1770194122943',
        //   transferAmount: 2000,
        //   referenceCode: '663ITC126035AP1V',
        //   id: 41156803
        // }

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
        // Format content: xxx-xxx-SUBSuseridtimestamp (no special characters)
        // Example: 117047966275-0918707142-SUBSfLScdV1o1770194262519
        const contentParts = content.split('-');
        const orderId = contentParts[contentParts.length - 1]; // Get last part

        if (!orderId.startsWith('SUBS')) {
            console.error("❌ Invalid content format, not a subscription payment:", content);
            return NextResponse.json(
                { success: false, message: "Not a subscription payment" },
                { status: 400 }
            );
        }

        console.log("🔍 Full content:", content);
        console.log("🔍 Parsed orderId:", orderId);

        // Tìm payment trong database bằng orderId
        const payment = await db.paymentHistory.findFirst({
            where: {
                vnpayOrderId: orderId,
                status: "PENDING",
            },
        });

        if (!payment) {
            console.error("❌ Payment not found or already processed:", orderId);
            return NextResponse.json(
                { success: false, message: "Payment not found" },
                { status: 404 }
            );
        }

        const userId = payment.userId;
        console.log("✅ Found payment for user:", userId);

        // Verify user exists
        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            console.error("❌ User not found:", userId);
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        console.log("✅ User found:", user.email);

        // Determine tier từ amount
        const tier = transferAmount === 200000 ? "BASIC" :
            transferAmount === 500000 ? "PREMIUM" :
                payment.tier; // Fallback to tier from payment record

        if (!tier) {
            console.error("❌ Cannot determine tier from amount:", transferAmount);
            return NextResponse.json(
                { success: false, message: "Invalid payment amount" },
                { status: 400 }
            );
        }

        // Cập nhật hoặc tạo subscription
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 tháng subscription

        await db.subscription.upsert({
            where: { userId },
            update: {
                tier,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                vnpayTransactionId: String(transactionId || referenceCode),
                updatedAt: now,
            },
            create: {
                userId,
                tier,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                vnpayTransactionId: String(transactionId || referenceCode),
            },
        });

        // Update pending payment to success
        await db.paymentHistory.updateMany({
            where: {
                vnpayOrderId: orderId,
                status: "PENDING",
            },
            data: {
                status: "SUCCESS",
                paidAt: now,
                vnpayTransactionId: String(transactionId || referenceCode),
                vnpayBankCode: gateway,
                amount: transferAmount, // Update với số tiền thực tế
            },
        });

        console.log("✅ Subscription activated successfully for user:", userId);
        console.log("   Order ID:", orderId);
        console.log("   Amount:", transferAmount);
        console.log("   Tier:", tier);

        return NextResponse.json({
            success: true,
            message: "Subscription activated",
        });
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint để test webhook
 */
export async function GET() {
    return NextResponse.json({
        message: "SEPay webhook endpoint is active",
        endpoint: "/api/webhook/sepay",
        method: "POST",
    });
}

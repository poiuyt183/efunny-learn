import { NextRequest, NextResponse } from "next/server";
import { sepay } from "@/lib/sepay";
import prisma from "@/lib/db";
import { createPaymentRecord, upgradeSubscription } from "@/features/subscription/actions/subscription-actions";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Get all SEPay return parameters
        const sepayParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            sepayParams[key] = value;
        });

        // Verify signature
        const isValid = sepay.verifyReturnUrl(sepayParams);

        if (!isValid) {
            return NextResponse.redirect(
                new URL("/dashboard/subscription?error=invalid_signature", request.url)
            );
        }

        const responseCode = sepayParams.response_code || sepayParams.status;
        const transactionNo = sepayParams.transaction_no || sepayParams.trans_id;
        const orderId = sepayParams.order_id;
        const amount = Number.parseInt(sepayParams.amount);
        const bankCode = sepayParams.bank_code;

        // Check if payment was successful
        if (responseCode !== "00" && responseCode !== "success") {
            // Payment failed
            return NextResponse.redirect(
                new URL(`/dashboard/subscription?error=payment_failed&code=${responseCode}`, request.url)
            );
        }

        // Extract userId and tier from orderId (format: SUBS_{userId}_{timestamp})
        const orderParts = orderId.split("_");
        if (orderParts.length < 3 || orderParts[0] !== "SUBS") {
            return NextResponse.redirect(
                new URL("/dashboard/subscription?error=invalid_order", request.url)
            );
        }

        // Find user by partial ID match (we only stored first 8 chars)
        const userIdPrefix = orderParts[1];
        const users = await prisma.user.findMany({
            where: {
                id: {
                    startsWith: userIdPrefix,
                },
            },
        });

        if (users.length === 0) {
            return NextResponse.redirect(
                new URL("/dashboard/subscription?error=user_not_found", request.url)
            );
        }

        const user = users[0];

        // Determine tier based on amount
        let tier: "BASIC" | "PREMIUM" = "BASIC";
        if (amount >= 199000) {
            tier = "PREMIUM";
        } else if (amount >= 99000) {
            tier = "BASIC";
        }

        // Check if payment already processed
        const existingPayment = await prisma.paymentHistory.findUnique({
            where: {
                vnpayTransactionId: transactionNo || `SEPAY_${orderId}`,
            },
        });

        if (!existingPayment) {
            // Create payment record
            await createPaymentRecord({
                userId: user.id,
                tier,
                amount,
                vnpayTransactionId: transactionNo || `SEPAY_${orderId}`,
                vnpayOrderId: orderId,
                vnpayBankCode: bankCode,
            });

            // Upgrade subscription
            await upgradeSubscription(tier);
        }

        // Redirect to success page
        return NextResponse.redirect(
            new URL("/dashboard/subscription?success=true", request.url)
        );
    } catch (error) {
        console.error("SEPay return error:", error);
        return NextResponse.redirect(
            new URL("/dashboard/subscription?error=processing_failed", request.url)
        );
    }
}

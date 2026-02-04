"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { SubscriptionTier } from "../constants";

/**
 * Get current user's subscription
 */
export async function getCurrentSubscription() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        const subscription = await prisma.subscription.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        // Create free subscription if doesn't exist
        if (!subscription) {
            const newSubscription = await prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    tier: "FREE",
                    status: "ACTIVE",
                },
            });

            return {
                success: true,
                data: newSubscription,
            };
        }

        return {
            success: true,
            data: subscription,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Upgrade subscription tier
 */
export async function upgradeSubscription(tier: SubscriptionTier) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        if (tier === "FREE") {
            return {
                success: false,
                error: "Không thể nâng cấp xuống FREE",
            };
        }

        // Get or create subscription
        let subscription = await prisma.subscription.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!subscription) {
            subscription = await prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    tier: "FREE",
                    status: "ACTIVE",
                },
            });
        }

        // Check if already on this tier or higher
        const tierOrder = { FREE: 0, BASIC: 1, PREMIUM: 2 };
        if (tierOrder[subscription.tier as SubscriptionTier] >= tierOrder[tier]) {
            return {
                success: false,
                error: "Bạn đã có gói này hoặc cao hơn",
            };
        }

        // Update subscription
        const updated = await prisma.subscription.update({
            where: {
                userId: session.user.id,
            },
            data: {
                tier,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });

        revalidatePath("/dashboard/subscription");

        return {
            success: true,
            data: updated,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Downgrade subscription tier - DISABLED
 * Users cannot downgrade their subscription. They can only cancel.
 */
export async function downgradeSubscription(tier: SubscriptionTier) {
    return {
        success: false,
        error: "Không thể hạ cấp gói. Vui lòng hủy gói hiện tại nếu muốn chuyển về gói FREE.",
    };
}

/**
 * Cancel subscription
 */
export async function cancelSubscription() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        const subscription = await prisma.subscription.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!subscription) {
            return {
                success: false,
                error: "Không tìm thấy subscription",
            };
        }

        if (subscription.tier === "FREE") {
            return {
                success: false,
                error: "Không thể hủy gói FREE",
            };
        }

        // Update subscription to cancelled, will downgrade to FREE at period end
        const updated = await prisma.subscription.update({
            where: {
                userId: session.user.id,
            },
            data: {
                status: "CANCELLED",
            },
        });

        revalidatePath("/dashboard/subscription");

        return {
            success: true,
            data: updated,
            message: "Đã hủy gói thành công. Bạn sẽ vẫn sử dụng được đến hết kỳ hiện tại.",
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get payment history
 */
export async function getPaymentHistory() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        const payments = await prisma.paymentHistory.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            data: payments,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Create payment record after successful payment
 */
export async function createPaymentRecord(data: {
    userId: string;
    tier: SubscriptionTier;
    amount: number;
    vnpayTransactionId: string;
    vnpayOrderId: string;
    vnpayBankCode?: string;
}) {
    try {
        const payment = await prisma.paymentHistory.create({
            data: {
                ...data,
                status: "SUCCESS",
                paidAt: new Date(),
            },
        });

        return {
            success: true,
            data: payment,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

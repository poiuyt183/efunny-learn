"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { startOfWeek, startOfMonth, subMonths, subDays } from "date-fns";

// ============================================
// Authorization Helper
// ============================================

async function requireAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }

    return session;
}

// ============================================
// Dashboard Stats
// ============================================

export async function getDashboardStats() {
    await requireAdmin();

    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    // Total users by role
    const [totalUsers, newUsersThisWeek, subscriptions, monthlyRevenue] =
        await Promise.all([
            prisma.user.groupBy({
                by: ["role"],
                _count: true,
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: weekStart,
                    },
                },
            }),
            prisma.subscription.groupBy({
                by: ["tier"],
                where: {
                    status: "ACTIVE",
                    tier: {
                        in: ["BASIC", "PREMIUM"],
                    },
                },
                _count: true,
            }),
            prisma.paymentHistory.aggregate({
                where: {
                    status: "SUCCESS",
                    createdAt: {
                        gte: monthStart,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

    const usersByRole = totalUsers.reduce(
        (acc, curr) => {
            acc[curr.role] = curr._count;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalUserCount = totalUsers.reduce((sum, curr) => sum + curr._count, 0);
    const activeSubscriptionsCount = subscriptions.reduce(
        (sum, curr) => sum + curr._count,
        0,
    );

    return {
        totalUsers: totalUserCount,
        usersByRole,
        newUsersThisWeek,
        activeSubscriptions: activeSubscriptionsCount,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
    };
}

// ============================================
// Recent Activity
// ============================================

export async function getRecentActivity() {
    await requireAdmin();

    // Get 10 most recent users
    const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    // Get pending tutor verifications count
    const pendingTutors = await prisma.tutor.count({
        where: {
            verified: false,
        },
    });

    return {
        recentUsers,
        pendingTutors,
    };
}

// ============================================
// Chart Data - User Growth
// ============================================

export async function getUserGrowthData() {
    await requireAdmin();

    const now = new Date();
    const last30Days = subDays(now, 30);

    // Get user signups grouped by day for the last 30 days
    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: last30Days,
            },
        },
        select: {
            createdAt: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    // Group by date
    const growthByDay: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
        const date = subDays(now, 29 - i);
        const dateKey = date.toISOString().split("T")[0];
        growthByDay[dateKey] = 0;
    }

    for (const user of users) {
        const dateKey = user.createdAt.toISOString().split("T")[0];
        if (growthByDay[dateKey] !== undefined) {
            growthByDay[dateKey]++;
        }
    }

    return Object.entries(growthByDay).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
        }),
        users: count,
    }));
}

// ============================================
// Chart Data - Revenue Trend
// ============================================

export async function getRevenueTrendData() {
    await requireAdmin();

    const now = new Date();
    const last6Months = subMonths(now, 6);

    // Get revenue by month
    const payments = await prisma.paymentHistory.findMany({
        where: {
            status: "SUCCESS",
            createdAt: {
                gte: last6Months,
            },
        },
        select: {
            amount: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    // Group by month
    const revenueByMonth: Record<string, number> = {};

    for (let i = 0; i < 6; i++) {
        const date = subMonths(now, 5 - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        revenueByMonth[monthKey] = 0;
    }

    for (const payment of payments) {
        const monthKey = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (revenueByMonth[monthKey] !== undefined) {
            revenueByMonth[monthKey] += payment.amount;
        }
    }

    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("vi-VN", {
            month: "short",
            year: "numeric",
        }),
        revenue: revenue,
    }));
}

// ============================================
// Chart Data - Subscription Distribution
// ============================================

export async function getSubscriptionDistribution() {
    await requireAdmin();

    const subscriptions = await prisma.subscription.groupBy({
        by: ["tier"],
        where: {
            status: "ACTIVE",
        },
        _count: true,
    });

    return subscriptions.map((sub) => ({
        tier: sub.tier,
        count: sub._count,
    }));
}

// ============================================
// Chart Data - User Role Distribution
// ============================================

export async function getUserRoleDistribution() {
    await requireAdmin();

    const users = await prisma.user.groupBy({
        by: ["role"],
        _count: true,
    });

    return users.map((user) => ({
        role: user.role,
        count: user._count,
    }));
}

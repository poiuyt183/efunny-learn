"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";

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
// Children Queries
// ============================================

export async function getChildren(options?: {
    search?: string;
    grade?: number;
    spiritAnimal?: string;
    page?: number;
    limit?: number;
}) {
    await requireAdmin();

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.search) {
        where.OR = [
            { name: { contains: options.search, mode: "insensitive" } },
            {
                user: {
                    email: { contains: options.search, mode: "insensitive" },
                },
            },
        ];
    }

    if (options?.grade) {
        where.grade = options.grade;
    }

    if (options?.spiritAnimal) {
        where.spiritAnimal = {
            slug: options.spiritAnimal,
        };
    }

    const [children, total] = await Promise.all([
        prisma.child.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
                spiritAnimal: {
                    select: {
                        name: true,
                        slug: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.child.count({ where }),
    ]);

    return {
        children,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getChildDetails(childId: string) {
    await requireAdmin();

    const child = await prisma.child.findUnique({
        where: { id: childId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
            childUser: {
                select: {
                    id: true,
                    email: true,
                },
            },
            spiritAnimal: true,
            analysis: true,
            chatSessions: {
                take: 10,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    _count: {
                        select: {
                            messages: true,
                        },
                    },
                },
            },
            bookings: {
                take: 10,
                orderBy: {
                    scheduledAt: "desc",
                },
                include: {
                    tutor: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            dailyUsage: {
                orderBy: {
                    date: "desc",
                },
                take: 7,
            },
        },
    });

    if (!child) {
        throw new Error("Child not found");
    }

    // Calculate total questions asked
    const totalQuestions = child.dailyUsage.reduce(
        (sum, day) => sum + day.questionsAsked,
        0,
    );

    return {
        ...child,
        totalQuestions,
    };
}

// ============================================
// Parents Queries
// ============================================

export async function getParents(options?: {
    search?: string;
    tier?: string;
    page?: number;
    limit?: number;
}) {
    await requireAdmin();

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
        role: "PARENT",
    };

    if (options?.search) {
        where.OR = [
            { name: { contains: options.search, mode: "insensitive" } },
            { email: { contains: options.search, mode: "insensitive" } },
        ];
    }

    if (options?.tier) {
        where.subscription = {
            tier: options.tier,
        };
    }

    const [parents, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                subscription: true,
                _count: {
                    select: {
                        children: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        parents,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getParentDetails(userId: string) {
    await requireAdmin();

    const parent = await prisma.user.findUnique({
        where: { id: userId, role: "PARENT" },
        include: {
            subscription: true,
            children: {
                include: {
                    spiritAnimal: true,
                },
            },
            paymentHistory: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 20,
            },
            bookingPayments: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 20,
                include: {
                    bookings: {
                        include: {
                            child: {
                                select: {
                                    name: true,
                                },
                            },
                            tutor: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!parent) {
        throw new Error("Parent not found");
    }

    return parent;
}

// ============================================
// Tutors Queries
// ============================================

export async function getTutors(options?: {
    search?: string;
    verified?: boolean;
    subject?: string;
    page?: number;
    limit?: number;
}) {
    await requireAdmin();

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.search) {
        where.user = {
            OR: [
                { name: { contains: options.search, mode: "insensitive" } },
                { email: { contains: options.search, mode: "insensitive" } },
            ],
        };
    }

    if (options?.verified !== undefined) {
        where.verified = options.verified;
    }

    if (options?.subject) {
        where.subjects = {
            has: options.subject,
        };
    }

    const [tutors, total] = await Promise.all([
        prisma.tutor.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.tutor.count({ where }),
    ]);

    return {
        tutors,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getTutorDetails(tutorId: string) {
    await requireAdmin();

    const tutor = await prisma.tutor.findUnique({
        where: { id: tutorId },
        include: {
            user: true,
            bookings: {
                orderBy: {
                    scheduledAt: "desc",
                },
                take: 20,
                include: {
                    child: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    if (!tutor) {
        throw new Error("Tutor not found");
    }

    // Calculate completion rate
    const completedBookings = tutor.bookings.filter(
        (b) => b.status === "COMPLETED",
    ).length;
    const completionRate =
        tutor.totalSessions > 0
            ? (completedBookings / tutor.totalSessions) * 100
            : 0;

    return {
        ...tutor,
        completionRate,
    };
}

// ============================================
// Tutor Actions
// ============================================

export async function verifyTutor(tutorId: string, approved: boolean) {
    await requireAdmin();

    await prisma.tutor.update({
        where: { id: tutorId },
        data: {
            verified: approved,
        },
    });

    // TODO: Send email notification to tutor

    return { success: true };
}

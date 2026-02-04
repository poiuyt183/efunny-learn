"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import {
    tutorSetupSchema,
    tutorUpdateSchema,
    type TutorSetupInput,
    type TutorUpdateInput,
} from "../schemas/tutor-schema";

/**
 * Create tutor profile during onboarding
 */
export async function createTutorProfile(input: TutorSetupInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = tutorSetupSchema.parse(input);

        // Check if user already has a tutor profile
        const existingTutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
        });

        if (existingTutor) {
            throw new Error("Bạn đã có hồ sơ gia sư");
        }

        // Update user role to TUTOR
        await prisma.user.update({
            where: { id: session.user.id },
            data: { role: "TUTOR" },
        });

        // Create tutor profile
        const tutor = await prisma.tutor.create({
            data: {
                userId: session.user.id,
                subjects: validated.subjects,
                grades: validated.grades,
                hourlyRate: validated.hourlyRate,
                bio: validated.bio,
                bankAccount: validated.bankAccount || undefined,
                certificates: validated.certificates ?? [],
                verified: false, // Requires admin approval
            },
        });

        return {
            success: true,
            data: tutor,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Update tutor profile
 */
export async function updateTutorProfile(input: TutorUpdateInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = tutorUpdateSchema.parse(input);

        // Check if tutor exists
        const tutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
        });

        console.log({ tutor })

        if (!tutor) {
            throw new Error("Không tìm thấy hồ sơ gia sư");
        }

        // Filter out undefined values from validated data
        const updateData = Object.fromEntries(
            Object.entries(validated).filter(([_, value]) => value !== undefined)
        );

        // Update tutor profile
        const updatedTutor = await prisma.tutor.update({
            where: { userId: session.user.id },
            data: updateData,
        });

        return {
            success: true,
            data: updatedTutor,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get current tutor profile
 */
export async function getTutorProfile() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const tutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: tutor,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Check if user is a tutor
 */
export async function checkIsTutor() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { isTutor: false, hasProfile: false };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                tutor: true,
            },
        });

        return {
            isTutor: user?.role === "TUTOR",
            hasProfile: !!user?.tutor,
            isVerified: user?.tutor?.verified ?? false,
        };
    } catch (error) {
        return { isTutor: false, hasProfile: false };
    }
}

/**
 * Get tutor statistics
 */
export async function getTutorStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const tutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
            include: {
                bookings: {
                    where: {
                        status: "COMPLETED",
                    },
                },
            },
        });

        console.log({ tutor })

        if (!tutor) {
            throw new Error("Không tìm thấy hồ sơ gia sư");
        }

        const totalEarnings = tutor.bookings.reduce(
            (sum, booking) => sum + (booking.totalAmount - booking.platformFee),
            0
        );

        const thisMonthBookings = tutor.bookings.filter((booking) => {
            const bookingDate = new Date(booking.scheduledAt);
            const now = new Date();
            return (
                bookingDate.getMonth() === now.getMonth() &&
                bookingDate.getFullYear() === now.getFullYear()
            );
        });

        const thisMonthEarnings = thisMonthBookings.reduce(
            (sum, booking) => sum + (booking.totalAmount - booking.platformFee),
            0
        );

        return {
            success: true,
            data: {
                totalSessions: tutor.totalSessions,
                totalEarnings,
                thisMonthEarnings,
                thisMonthSessions: thisMonthBookings.length,
                rating: tutor.rating,
                verified: tutor.verified,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Search tutors with filters
 */
export async function searchTutors(filters?: {
    subject?: string;
    grade?: number;
    minRate?: number;
    maxRate?: number;
    verifiedOnly?: boolean;
}) {
    try {
        const where: any = {};

        if (filters?.subject) {
            where.subjects = {
                has: filters.subject,
            };
        }

        if (filters?.grade) {
            where.grades = {
                has: filters.grade,
            };
        }

        if (filters?.minRate || filters?.maxRate) {
            where.hourlyRate = {};
            if (filters.minRate) {
                where.hourlyRate.gte = filters.minRate;
            }
            if (filters.maxRate) {
                where.hourlyRate.lte = filters.maxRate;
            }
        }

        if (filters?.verifiedOnly) {
            where.verified = true;
        }

        const tutors = await prisma.tutor.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: [
                { verified: "desc" },
                { rating: "desc" },
                { totalSessions: "desc" },
            ],
        });

        return {
            success: true,
            data: tutors,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get tutor by ID (for public view)
 */
export async function getTutorById(id: string) {
    try {
        const tutor = await prisma.tutor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                bookings: {
                    where: {
                        status: "COMPLETED",
                    },
                    select: {
                        id: true,
                        notes: true,
                    },
                },
            },
        });

        if (!tutor) {
            throw new Error("Không tìm thấy gia sư");
        }

        return {
            success: true,
            data: tutor,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

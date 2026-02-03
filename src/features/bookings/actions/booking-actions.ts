"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
    createBookingSchema,
    type CreateBookingInput,
    type UpdateBookingInput,
} from "../schemas/booking-schema";

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = createBookingSchema.parse(input);

        // Verify child belongs to user
        const child = await prisma.child.findFirst({
            where: {
                id: validated.childId,
                userId: session.user.id,
            },
        });

        if (!child) {
            throw new Error("Không tìm thấy thông tin con");
        }

        // Get tutor info
        const tutor = await prisma.tutor.findUnique({
            where: { id: validated.tutorId },
        });

        if (!tutor) {
            throw new Error("Không tìm thấy gia sư");
        }

        // Calculate total amount
        const totalAmount = (tutor.hourlyRate * validated.durationMinutes) / 60;
        const platformFee = Math.round(totalAmount * 0.2); // 20% platform fee

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                childId: validated.childId,
                tutorId: validated.tutorId,
                scheduledAt: validated.scheduledAt,
                durationMinutes: validated.durationMinutes,
                totalAmount,
                platformFee,
                status: "PENDING",
                notes: validated.notes,
            },
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
        });

        revalidatePath("/dashboard/bookings");

        return {
            success: true,
            data: booking,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get all bookings for current user
 */
export async function getBookings() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const bookings = await prisma.booking.findMany({
            where: {
                child: {
                    userId: session.user.id,
                },
            },
            include: {
                child: {
                    select: {
                        name: true,
                        grade: true,
                    },
                },
                tutor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                scheduledAt: "desc",
            },
        });

        return {
            success: true,
            data: bookings,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const booking = await prisma.booking.findFirst({
            where: {
                id,
                child: {
                    userId: session.user.id,
                },
            },
            include: {
                child: {
                    select: {
                        name: true,
                        grade: true,
                    },
                },
                tutor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!booking) {
            throw new Error("Không tìm thấy lịch đặt");
        }

        return {
            success: true,
            data: booking,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Verify booking belongs to user
        const booking = await prisma.booking.findFirst({
            where: {
                id,
                child: {
                    userId: session.user.id,
                },
            },
        });

        if (!booking) {
            throw new Error("Không tìm thấy lịch đặt");
        }

        if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
            throw new Error("Không thể hủy lịch này");
        }

        // Update status to cancelled
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        revalidatePath("/dashboard/bookings");

        return {
            success: true,
            data: updatedBooking,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

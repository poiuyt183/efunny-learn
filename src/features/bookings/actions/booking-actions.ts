"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
    createBookingSchema,
    createMultipleBookingsSchema,
    type CreateBookingInput,
    type CreateMultipleBookingsInput,
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
 * Create multiple bookings for multiple dates
 */
export async function createMultipleBookings(input: CreateMultipleBookingsInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = createMultipleBookingsSchema.parse(input);

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

        // Calculate total amount per session
        const totalAmount = (tutor.hourlyRate * validated.durationMinutes) / 60;
        const platformFee = Math.round(totalAmount * 0.2); // 20% platform fee

        // Parse time slot
        const [hours, minutes] = validated.timeSlot.split(":").map(Number);

        // Create bookings for each selected date
        const bookingPromises = validated.scheduledDates.map((date) => {
            const scheduledAt = new Date(date);
            scheduledAt.setHours(hours, minutes, 0, 0);

            return prisma.booking.create({
                data: {
                    childId: validated.childId,
                    tutorId: validated.tutorId,
                    scheduledAt,
                    durationMinutes: validated.durationMinutes,
                    totalAmount,
                    platformFee,
                    status: "PENDING",
                    notes: validated.notes,
                },
            });
        });

        const bookings = await Promise.all(bookingPromises);

        revalidatePath("/dashboard/bookings");

        return {
            success: true,
            data: bookings,
            message: `Đã tạo ${bookings.length} lịch học thành công`,
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

/**
 * Get all bookings for a tutor (for tutor dashboard)
 */
export async function getTutorBookings(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Check if user is a tutor
        const tutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
        });

        if (!tutor) {
            throw new Error("Bạn không phải là gia sư");
        }

        const where: any = {
            tutorId: tutor.id,
        };

        // Apply filters
        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.startDate || filters?.endDate) {
            where.scheduledAt = {};
            if (filters.startDate) {
                where.scheduledAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.scheduledAt.lte = filters.endDate;
            }
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                child: {
                    select: {
                        name: true,
                        grade: true,
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
            orderBy: {
                scheduledAt: "asc",
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
 * Update booking status (for tutors)
 */
export async function updateBookingStatus(bookingId: string, status: "CONFIRMED" | "COMPLETED") {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Check if user is a tutor
        const tutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
        });

        if (!tutor) {
            throw new Error("Bạn không phải là gia sư");
        }

        // Verify booking belongs to tutor
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                tutorId: tutor.id,
            },
        });

        if (!booking) {
            throw new Error("Không tìm thấy lịch đặt");
        }

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status,
                updatedAt: new Date(),
            },
        });

        // If completed, update tutor stats
        if (status === "COMPLETED") {
            await prisma.tutor.update({
                where: { id: tutor.id },
                data: {
                    totalSessions: {
                        increment: 1,
                    },
                },
            });
        }

        revalidatePath("/tutor/dashboard");

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

/**
 * Reject/Cancel booking (for tutors)
 */
export async function rejectBookingAsTutor(bookingId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Check if user is a tutor
        const tutor = await prisma.tutor.findUnique({
            where: { userId: session.user.id },
        });

        if (!tutor) {
            throw new Error("Bạn không phải là gia sư");
        }

        // Verify booking belongs to tutor
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                tutorId: tutor.id,
            },
        });

        if (!booking) {
            throw new Error("Không tìm thấy lịch đặt");
        }

        if (booking.status !== "PENDING") {
            throw new Error("Chỉ có thể từ chối lịch đang chờ xác nhận");
        }

        // Update booking status to cancelled
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "CANCELLED",
                updatedAt: new Date(),
            },
        });

        revalidatePath("/tutor/dashboard");

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

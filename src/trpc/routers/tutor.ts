import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";

export const tutorRouter = createTRPCRouter({
    // Get all tutors with optional filters
    getAll: baseProcedure
        .input(
            z.object({
                subject: z.string().optional(),
                grade: z.number().optional(),
                minRate: z.number().optional(),
                maxRate: z.number().optional(),
                verifiedOnly: z.boolean().optional(),
                limit: z.number().min(1).max(100).default(20),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ input }) => {
            const {
                subject,
                grade,
                minRate,
                maxRate,
                verifiedOnly,
                limit,
                cursor,
            } = input;

            const where: any = {};

            if (subject) {
                where.subjects = { has: subject };
            }

            if (grade) {
                where.grades = { has: grade };
            }

            if (minRate || maxRate) {
                where.hourlyRate = {};
                if (minRate) where.hourlyRate.gte = minRate;
                if (maxRate) where.hourlyRate.lte = maxRate;
            }

            if (verifiedOnly) {
                where.verified = true;
            }

            const tutors = await prisma.tutor.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: [{ rating: "desc" }, { totalSessions: "desc" }],
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

            let nextCursor: string | undefined = undefined;
            if (tutors.length > limit) {
                const nextItem = tutors.pop();
                nextCursor = nextItem?.id;
            }

            return {
                tutors,
                nextCursor,
            };
        }),

    // Get tutor by ID
    getById: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const tutor = await prisma.tutor.findUnique({
                where: { id: input.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    bookings: {
                        where: {
                            status: "COMPLETED",
                        },
                        take: 5,
                        orderBy: { scheduledAt: "desc" },
                    },
                },
            });

            return tutor;
        }),

    // Get tutor statistics
    getStats: baseProcedure
        .input(z.object({ tutorId: z.string() }))
        .query(async ({ input }) => {
            const tutor = await prisma.tutor.findUnique({
                where: { id: input.tutorId },
                include: {
                    bookings: {
                        where: {
                            status: "COMPLETED",
                        },
                    },
                },
            });

            if (!tutor) {
                throw new Error("Tutor not found");
            }

            const totalEarnings = tutor.bookings.reduce(
                (sum, booking) => sum + (booking.totalAmount - booking.platformFee),
                0
            );

            const now = new Date();
            const thisMonthBookings = tutor.bookings.filter((booking) => {
                const bookingDate = new Date(booking.scheduledAt);
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
                totalSessions: tutor.totalSessions,
                totalEarnings,
                thisMonthEarnings,
                thisMonthSessions: thisMonthBookings.length,
                rating: tutor.rating,
                verified: tutor.verified,
            };
        }),

    // Search tutors by name or subjects
    search: baseProcedure
        .input(
            z.object({
                query: z.string(),
                limit: z.number().min(1).max(50).default(10),
            })
        )
        .query(async ({ input }) => {
            const tutors = await prisma.tutor.findMany({
                where: {
                    OR: [
                        {
                            user: {
                                name: {
                                    contains: input.query,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            subjects: {
                                hasSome: [input.query],
                            },
                        },
                    ],
                },
                take: input.limit,
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
                orderBy: [{ rating: "desc" }, { totalSessions: "desc" }],
            });

            return tutors;
        }),

    // Get recommended tutors for a child
    getRecommended: baseProcedure
        .input(
            z.object({
                childId: z.string(),
                limit: z.number().min(1).max(20).default(5),
            })
        )
        .query(async ({ input }) => {
            // Get child's info to match tutors
            const child = await prisma.child.findUnique({
                where: { id: input.childId },
                include: {
                    analysis: true,
                },
            });

            if (!child) {
                throw new Error("Child not found");
            }

            const where: any = {
                verified: true,
                grades: { has: child.grade },
            };

            // If child has favorite subjects, prioritize tutors who teach them
            if (child.analysis?.favoriteSubjects) {
                where.subjects = {
                    hasSome: child.analysis.favoriteSubjects,
                };
            }

            const tutors = await prisma.tutor.findMany({
                where,
                take: input.limit,
                orderBy: [{ rating: "desc" }, { totalSessions: "desc" }],
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

            return tutors;
        }),

    // Get tutor availability (placeholder for future implementation)
    getAvailability: baseProcedure
        .input(
            z.object({
                tutorId: z.string(),
                startDate: z.date(),
                endDate: z.date(),
            })
        )
        .query(async ({ input }) => {
            // Get all bookings for the tutor in the date range
            const bookings = await prisma.booking.findMany({
                where: {
                    tutorId: input.tutorId,
                    scheduledAt: {
                        gte: input.startDate,
                        lte: input.endDate,
                    },
                    status: {
                        in: ["PENDING", "CONFIRMED"],
                    },
                },
                select: {
                    scheduledAt: true,
                    durationMinutes: true,
                },
                orderBy: {
                    scheduledAt: "asc",
                },
            });

            return bookings;
        }),
});

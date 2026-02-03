"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import {
    childSchema,
    childUpdateSchema,
    type ChildInput,
    type ChildUpdateInput,
} from "../schemas/child-schema";
import { revalidatePath } from "next/cache";

/**
 * Create child profile
 */
export async function createChild(input: ChildInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = childSchema.parse(input);

        // Verify spirit animal exists
        const spiritAnimal = await prisma.spiritAnimal.findUnique({
            where: { id: validated.spiritAnimalId },
        });

        if (!spiritAnimal) {
            throw new Error("Spirit Animal không tồn tại");
        }

        // Create child
        const child = await prisma.child.create({
            data: {
                userId: session.user.id,
                name: validated.name,
                grade: validated.grade,
                birthYear: validated.birthYear,
                spiritAnimalId: validated.spiritAnimalId,
            },
            include: {
                spiritAnimal: true,
            },
        });

        revalidatePath("/dashboard/children");

        return {
            success: true,
            data: child,
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
 * Update child profile
 */
export async function updateChild(input: ChildUpdateInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = childUpdateSchema.parse(input);

        // Check if child exists and belongs to user
        const child = await prisma.child.findFirst({
            where: {
                id: validated.id,
                userId: session.user.id,
            },
        });

        if (!child) {
            throw new Error("Không tìm thấy hồ sơ con");
        }

        // If spirit animal is being changed, verify it exists
        if (validated.spiritAnimalId) {
            const spiritAnimal = await prisma.spiritAnimal.findUnique({
                where: { id: validated.spiritAnimalId },
            });

            if (!spiritAnimal) {
                throw new Error("Spirit Animal không tồn tại");
            }
        }

        // Filter out undefined values
        const { id, ...updateData } = validated;
        const filteredData = Object.fromEntries(
            Object.entries(updateData).filter(([_, value]) => value !== undefined)
        );

        // Update child
        const updatedChild = await prisma.child.update({
            where: { id: validated.id },
            data: filteredData,
            include: {
                spiritAnimal: true,
            },
        });

        revalidatePath("/dashboard/children");
        revalidatePath(`/dashboard/children/${validated.id}`);

        return {
            success: true,
            data: updatedChild,
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
 * Delete child profile
 */
export async function deleteChild(childId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Check if child exists and belongs to user
        const child = await prisma.child.findFirst({
            where: {
                id: childId,
                userId: session.user.id,
            },
        });

        if (!child) {
            throw new Error("Không tìm thấy hồ sơ con");
        }

        // Delete child (cascade will delete related records)
        await prisma.child.delete({
            where: { id: childId },
        });

        revalidatePath("/dashboard/children");

        return {
            success: true,
            message: "Đã xóa hồ sơ con",
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get all children of current user
 */
export async function getChildren() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const children = await prisma.child.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                spiritAnimal: true,
                analysis: true,
                _count: {
                    select: {
                        chatSessions: true,
                        bookings: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            data: children,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get single child by ID
 */
export async function getChildById(childId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const child = await prisma.child.findFirst({
            where: {
                id: childId,
                userId: session.user.id,
            },
            include: {
                spiritAnimal: true,
                analysis: true,
                chatSessions: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
                bookings: {
                    orderBy: { scheduledAt: "desc" },
                    take: 5,
                    include: {
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
                },
                dailyUsage: {
                    orderBy: { date: "desc" },
                    take: 30,
                },
            },
        });

        if (!child) {
            throw new Error("Không tìm thấy hồ sơ con");
        }

        return {
            success: true,
            data: child,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

/**
 * Get all spirit animals for selection
 */
export async function getSpiritAnimals() {
    try {
        const spiritAnimals = await prisma.spiritAnimal.findMany({
            orderBy: { name: "asc" },
        });

        return {
            success: true,
            data: spiritAnimals,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

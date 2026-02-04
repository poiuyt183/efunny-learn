"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

interface CreateChildAccountInput {
    childId: string;
    username: string;
    pin: string;
}

/**
 * Create a user account for a child so they can login independently
 */
export async function createChildAccount(input: CreateChildAccountInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Verify child belongs to parent
        const child = await prisma.child.findFirst({
            where: {
                id: input.childId,
                userId: session.user.id,
            },
        });

        if (!child) {
            throw new Error("Không tìm thấy thông tin con");
        }

        // Check if child already has an account
        if (child.childUserId) {
            throw new Error("Con đã có tài khoản");
        }

        // Check if username is already used
        if (input.username) {
            const existingChild = await prisma.child.findUnique({
                where: { username: input.username },
            });

            if (existingChild) {
                throw new Error("Tên đăng nhập đã được sử dụng");
            }
        }

        // Hash PIN
        const hashedPin = await bcrypt.hash(input.pin, 10);

        // Create user account for child (keeping email for compatibility)
        const childUser = await prisma.user.create({
            data: {
                id: `child-${child.id}`,
                name: child.name,
                email: `${input.username}@child.local`, // Use a placeholder email
                emailVerified: true, // Auto-verify since parent created it
                role: "CHILD",
                updatedAt: new Date(),
            },
        });

        // Create account with password
        await prisma.account.create({
            data: {
                id: `${childUser.id}-account`,
                accountId: childUser.id,
                providerId: "credential",
                userId: childUser.id,
                password: hashedPin,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // Link child profile to user account and save username/PIN
        await prisma.child.update({
            where: { id: input.childId },
            data: {
                childUserId: childUser.id,
                username: input.username,
                pin: hashedPin,
            },
        });

        return {
            success: true,
            data: {
                username: input.username,
                childId: child.id,
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
 * Check if child has an account
 */
export async function checkChildHasAccount(childId: string) {
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
                childUser: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        if (!child) {
            throw new Error("Không tìm thấy thông tin con");
        }

        return {
            success: true,
            data: {
                hasAccount: !!child.childUserId,
                username: child.username,
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
 * Delete child account (when parent deletes child profile or manually)
 */
export async function deleteChildAccount(childId: string) {
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
        });

        if (!child) {
            throw new Error("Không tìm thấy thông tin con");
        }

        if (!child.childUserId) {
            throw new Error("Con chưa có tài khoản");
        }

        // Unlink child account
        await prisma.child.update({
            where: { id: childId },
            data: {
                childUserId: null,
            },
        });

        // Delete user account (cascade will delete sessions and accounts)
        await prisma.user.delete({
            where: { id: child.childUserId },
        });

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra",
        };
    }
}

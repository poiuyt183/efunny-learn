"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

interface ChildSignInInput {
    username: string;
    pin: string;
}

/**
 * Sign in a child using username and PIN
 */
export async function signInChild(input: ChildSignInInput) {
    try {
        // Find child by username
        const child = await prisma.child.findUnique({
            where: { username: input.username },
            include: {
                childUser: true,
            },
        });

        if (!child || !child.childUser || !child.pin) {
            throw new Error("Tên đăng nhập hoặc mã PIN không đúng");
        }

        // Verify PIN
        const isValidPin = await bcrypt.compare(input.pin, child.pin);
        if (!isValidPin) {
            throw new Error("Tên đăng nhập hoặc mã PIN không đúng");
        }

        // Create a session for the child user
        // We'll use better-auth's session creation
        const sessionToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create session in database
        await prisma.session.create({
            data: {
                id: crypto.randomUUID(),
                userId: child.childUser.id,
                token: sessionToken,
                expiresAt,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // Set the session cookie
        const cookieStore = await cookies();
        cookieStore.set("better-auth.session_token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expiresAt,
            path: "/",
        });

        return {
            success: true,
            data: {
                userId: child.childUser.id,
                childId: child.id,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập",
        };
    }
}

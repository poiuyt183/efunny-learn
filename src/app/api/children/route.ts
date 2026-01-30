import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

const createChildSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    grade: z.coerce.number().min(1).max(12),
    birthYear: z.coerce.number().min(2000).max(new Date().getFullYear()),
    spiritAnimalId: z.string().min(1, "Please select a spirit animal"),
});

export async function POST(req: Request) {
    try {
        const session = await requireAuth();

        // Only parents can create child profiles
        if (session.user.role !== "PARENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = createChildSchema.parse(body);

        // Check profile limit based on subscription
        // TODO: Implement proper subscription check
        // For now, check FREE plan limit (1 child)
        const existingChildrenCount = await prisma.child.count({
            where: { userId: session.user.id },
        });

        // Check subscription plan
        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
        });

        const maxChildren =
            subscription?.tier === "PREMIUM"
                ? 5
                : subscription?.tier === "BASIC"
                    ? 2
                    : 1; // FREE

        if (existingChildrenCount >= maxChildren) {
            return NextResponse.json(
                {
                    error: `Upgrade required. You have reached the limit of ${maxChildren} profiles for your current plan.`,
                },
                { status: 403 },
            );
        }

        const child = await prisma.child.create({
            data: {
                ...validatedData,
                userId: session.user.id,
            },
        });

        return NextResponse.json(child);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        console.error("Error creating child profile:", error);
        return NextResponse.json(
            { error: "Failed to create child profile" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        const session = await requireAuth();

        if (session.user.role !== "PARENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const children = await prisma.child.findMany({
            where: { userId: session.user.id },
            include: {
                spiritAnimal: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(children);
    } catch (error) {
        console.error("Error fetching children:", error);
        return NextResponse.json(
            { error: "Failed to fetch children" },
            { status: 500 },
        );
    }
}

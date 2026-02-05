import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { BookingCheckoutClient } from "./checkout-client";

export default async function BookingCheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{
        childId?: string;
        tutorId?: string;
        dates?: string;
        time?: string;
        duration?: string;
        notes?: string;
    }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;

    // Validate required params
    if (!params.childId || !params.tutorId || !params.dates || !params.time || !params.duration) {
        redirect("/dashboard/tutors");
    }

    // Parse dates from comma-separated string
    const scheduledDates = params.dates.split(',').map(d => new Date(d));

    // Get child info
    const child = await prisma.child.findFirst({
        where: {
            id: params.childId,
            userId: session.user.id,
        },
    });

    if (!child) {
        redirect("/dashboard/children");
    }

    // Get tutor info
    const tutor = await prisma.tutor.findUnique({
        where: { id: params.tutorId },
        include: {
            user: true,
        },
    });

    if (!tutor) {
        redirect("/dashboard/tutors");
    }

    // Calculate pricing
    const durationMinutes = parseInt(params.duration);
    const amountPerSession = (tutor.hourlyRate * durationMinutes) / 60;
    const totalAmount = amountPerSession * scheduledDates.length;

    const bookingInfo = {
        childId: params.childId,
        childName: child.name,
        childGrade: child.grade,
        tutorId: params.tutorId,
        tutorName: tutor.user?.name || "Gia sư",
        scheduledDates,
        timeSlot: params.time,
        durationMinutes,
        notes: params.notes || "",
        hourlyRate: tutor.hourlyRate,
        amountPerSession: Math.round(amountPerSession),
        totalAmount: Math.round(totalAmount),
    };

    return <BookingCheckoutClient bookingInfo={bookingInfo} />;
}

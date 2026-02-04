import { z } from "zod";

export const createBookingSchema = z.object({
    childId: z.string().min(1, "Vui lòng chọn con"),
    tutorId: z.string().min(1, "Vui lòng chọn gia sư"),
    scheduledAt: z.date({
        error: "Vui lòng chọn thời gian",
    }),
    durationMinutes: z.number().min(60).max(180),
    notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"]),
    notes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

import { z } from "zod";

const currentYear = new Date().getFullYear();

// Step 1 validation (without spiritAnimalId)
export const childStepOneSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(50, "Tên tối đa 50 ký tự"),
    grade: z.number()
        .int("Khối lớp phải là số nguyên")
        .min(6, "Khối lớp từ 6 đến 12")
        .max(12, "Khối lớp từ 6 đến 12"),
    birthYear: z.number()
        .int("Năm sinh phải là số nguyên")
        .min(currentYear - 18, "Học sinh phải dưới 18 tuổi")
        .max(currentYear - 10, "Học sinh phải từ 10 tuổi trở lên"),
});

// Full validation schema (with spiritAnimalId)
export const childSchema = childStepOneSchema.extend({
    spiritAnimalId: z.string().min(1, "Vui lòng chọn Spirit Animal"),
});

export const childUpdateSchema = childSchema.partial().extend({
    id: z.string(),
});

export type ChildStepOneInput = z.infer<typeof childStepOneSchema>;
export type ChildInput = z.infer<typeof childSchema>;
export type ChildUpdateInput = z.infer<typeof childUpdateSchema>;

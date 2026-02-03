import { z } from "zod";

// Helper function to validate URL or JSON string with URL
const certificateValidator = z.string().refine(
    (val) => {
        // Try to parse as JSON first
        try {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed === 'object' && 'url' in parsed) {
                // Validate URL in JSON
                new URL(parsed.url);
                return true;
            }
        } catch {
            // Not JSON, try as plain URL
            try {
                new URL(val);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    },
    { message: "Link chứng chỉ không hợp lệ" }
);

// Validation schemas
export const tutorSetupSchema = z.object({
    subjects: z.array(z.string()).min(1, "Chọn ít nhất 1 môn học"),
    grades: z.array(z.number()).min(1, "Chọn ít nhất 1 khối lớp"),
    hourlyRate: z.number().min(50000, "Giá tối thiểu là 50,000 VND").max(1000000, "Giá tối đa là 1,000,000 VND"),
    bio: z.string().min(100, "Giới thiệu ít nhất 100 ký tự").max(1000, "Tối đa 1000 ký tự"),
    bankAccount: z.string().optional(),
    certificates: z.array(certificateValidator).min(1, "Thêm ít nhất 1 chứng chỉ").max(5, "Tối đa 5 chứng chỉ"),
});

export const tutorUpdateSchema = tutorSetupSchema.partial();

export type TutorSetupInput = z.infer<typeof tutorSetupSchema>;
export type TutorUpdateInput = z.infer<typeof tutorUpdateSchema>;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SpiritAnimalSelector } from "./spirit-animal-selector";

const createChildSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    grade: z.coerce.number().min(6, "Lớp từ 6-12").max(12, "Lớp từ 6-12"),
    birthYear: z.coerce
        .number()
        .min(2000, "Năm sinh không hợp lệ")
        .max(new Date().getFullYear(), "Năm sinh không hợp lệ"),
    spiritAnimalId: z.string().min(1, "Vui lòng chọn linh thú"),
});

type CreateChildValues = z.infer<typeof createChildSchema>;

interface CreateChildFormProps {
    onSuccess?: () => void;
}

export function CreateChildForm({ onSuccess }: CreateChildFormProps) {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);

    const form = useForm<CreateChildValues>({
        resolver: zodResolver(createChildSchema) as any,
        defaultValues: {
            name: "",
            grade: 6,
            birthYear: new Date().getFullYear() - 11, // Default to ~11 years old (Grade 6)
            spiritAnimalId: "",
        },
    });

    const onSubmit = async (values: CreateChildValues) => {
        try {
            const res = await fetch("/api/children", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create profile");
            }

            toast.success("Đã tạo profile thành công! 🎉");
            router.refresh();
            onSuccess?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
        }
    };

    const isPending = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 ? (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Thông tin cơ bản
                            </h2>
                            <p className="text-gray-500">Nhập thông tin của bé để bắt đầu</p>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên bé</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nguyễn Văn B" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lớp học (6-12)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={6} max={12} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="birthYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Năm sinh</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="button"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={async () => {
                                const isValid = await form.trigger([
                                    "name",
                                    "grade",
                                    "birthYear",
                                ]);
                                if (isValid) setStep(2);
                            }}
                        >
                            Tiếp tục: Chọn Linh Thú
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Chọn Linh Thú
                            </h2>
                            <p className="text-gray-500">
                                Linh thú sẽ đồng hành cùng bé trong suốt quá trình học tập
                            </p>
                        </div>

                        <FormField
                            control={form.control}
                            name="spiritAnimalId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <SpiritAnimalSelector
                                            onSelect={(id) => field.onChange(id)}
                                            selectedId={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-center" />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="w-1/3"
                                disabled={isPending}
                            >
                                Quay lại
                            </Button>
                            <Button
                                type="submit"
                                className="w-2/3 bg-green-600 hover:bg-green-700"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    "Hoàn tất tạo Profile"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </Form>
    );
}

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SpiritAnimalSelector } from "./SpiritAnimalSelector";
import { childStepOneSchema, type ChildInput, type ChildStepOneInput } from "../schemas/child-schema";
import { createChild } from "../actions/child-actions";
import type { SpiritAnimal } from "@/generated/prisma/client";
import { Loader2 } from "lucide-react";

interface ChildFormProps {
    spiritAnimals: SpiritAnimal[];
    onSuccess?: () => void;
}

const currentYear = new Date().getFullYear();
const gradeOptions = [6, 7, 8, 9, 10, 11, 12];
const birthYearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 18 + i);

export function ChildForm({ spiritAnimals, onSuccess }: ChildFormProps) {
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState<"info" | "spirit">("info");
    const [selectedSpiritId, setSelectedSpiritId] = useState<string>();
    const [formData, setFormData] = useState<ChildStepOneInput>();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ChildStepOneInput>({
        resolver: zodResolver(childStepOneSchema),
        mode: "onChange",
    });

    const grade = watch("grade");
    const birthYear = watch("birthYear");
    const name = watch("name");

    const handleNextStep = (data: ChildStepOneInput) => {
        setFormData(data);
        setStep("spirit");
    };

    const onSubmit = () => {
        console.log("onSubmit called", { formData, selectedSpiritId });

        if (!formData) {
            toast.error("Vui lòng điền thông tin ở bước trước");
            return;
        }

        if (!selectedSpiritId) {
            toast.error("Vui lòng chọn Spirit Animal");
            return;
        }

        startTransition(async () => {
            const result = await createChild({
                ...formData,
                spiritAnimalId: selectedSpiritId,
            });

            if (result.success) {
                toast.success("Đã thêm hồ sơ con thành công!");
                onSuccess?.();
            } else {
                toast.error(result.error || "Có lỗi xảy ra");
            }
        });
    };

    if (step === "spirit") {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Chọn Spirit Animal</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Spirit Animal sẽ đồng hành cùng con bạn trong hành trình học tập
                    </p>
                </div>

                <SpiritAnimalSelector
                    spiritAnimals={spiritAnimals}
                    selectedId={selectedSpiritId}
                    onSelect={setSelectedSpiritId}
                />

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("info")}
                        disabled={isPending}
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={!selectedSpiritId || isPending}
                        className="flex-1"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            "Hoàn tất"
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
            <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Tên con *</Label>
                    <Input
                        id="name"
                        placeholder="Nguyễn Văn A"
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                {/* Grade */}
                <div className="space-y-2">
                    <Label htmlFor="grade">Khối lớp *</Label>
                    <Select
                        value={grade?.toString() || ""}
                        onValueChange={(value) => setValue("grade", parseInt(value), { shouldValidate: true })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn khối lớp" />
                        </SelectTrigger>
                        <SelectContent>
                            {gradeOptions.map((g) => (
                                <SelectItem key={g} value={g.toString()}>
                                    Lớp {g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.grade && (
                        <p className="text-sm text-destructive">{errors.grade.message}</p>
                    )}
                </div>

                {/* Birth Year */}
                <div className="space-y-2">
                    <Label htmlFor="birthYear">Năm sinh *</Label>
                    <Select
                        value={birthYear?.toString() || ""}
                        onValueChange={(value) => setValue("birthYear", parseInt(value), { shouldValidate: true })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn năm sinh" />
                        </SelectTrigger>
                        <SelectContent>
                            {birthYearOptions.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.birthYear && (
                        <p className="text-sm text-destructive">{errors.birthYear.message}</p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full">
                Tiếp theo: Chọn Spirit Animal
            </Button>
        </form>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateTutorProfile } from "../actions/tutor-actions";
import { TutorSetupInput, tutorSetupSchema } from "../schemas/tutor-schema";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CertificateUploader } from "./CertificateUploader";

const SUBJECTS = [
    { value: "Toán", label: "Toán" },
    { value: "Tiếng Việt", label: "Tiếng Việt" },
    { value: "Tiếng Anh", label: "Tiếng Anh" },
    { value: "Khoa học", label: "Khoa học" },
    { value: "Lịch sử", label: "Lịch sử" },
    { value: "Địa lý", label: "Địa lý" },
    { value: "Vật lý", label: "Vật lý" },
    { value: "Hóa học", label: "Hóa học" },
    { value: "Sinh học", label: "Sinh học" },
];

const GRADES = [
    { value: 1, label: "Lớp 1" },
    { value: 2, label: "Lớp 2" },
    { value: 3, label: "Lớp 3" },
    { value: 4, label: "Lớp 4" },
    { value: 5, label: "Lớp 5" },
    { value: 6, label: "Lớp 6" },
    { value: 7, label: "Lớp 7" },
    { value: 8, label: "Lớp 8" },
    { value: 9, label: "Lớp 9" },
    { value: 10, label: "Lớp 10" },
    { value: 11, label: "Lớp 11" },
    { value: 12, label: "Lớp 12" },
];

interface TutorProfileFormProps {
    initialData?: TutorSetupInput;
    verified?: boolean;
}

export function TutorProfileForm({ initialData, verified = false }: TutorProfileFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TutorSetupInput>({
        resolver: zodResolver(tutorSetupSchema),
        defaultValues: initialData || {
            subjects: [],
            grades: [],
            hourlyRate: 100000,
            bio: "",
            bankAccount: "",
            certificates: [],
        },
    });

    async function onSubmit(data: TutorSetupInput) {
        setIsSubmitting(true);
        try {
            const result = await updateTutorProfile(data);

            if (result.success) {
                toast.success("Cập nhật hồ sơ thành công!");
                router.refresh();
            } else {
                toast.error(result.error || "Có lỗi xảy ra");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Verification Status */}
                {verified !== undefined && (
                    <Card className={verified ? "border-green-500 bg-green-50/50" : "border-amber-500 bg-amber-50/50"}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                {verified ? (
                                    <>
                                        <Badge variant="default" className="bg-green-600">
                                            Đã xác minh
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            Hồ sơ của bạn đã được xác minh. Bạn có thể nhận học sinh.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Badge variant="secondary" className="bg-amber-500 text-white">
                                            Chờ xác minh
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            Hồ sơ của bạn đang được xem xét. Vui lòng chờ 1-2 ngày làm việc.
                                        </p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Subjects Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Môn học giảng dạy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="subjects"
                            render={() => (
                                <FormItem>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {SUBJECTS.map((subject) => (
                                            <FormField
                                                key={subject.value}
                                                control={form.control}
                                                name="subjects"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={subject.value}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(subject.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, subject.value])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: any) => value !== subject.value
                                                                                )
                                                                            );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {subject.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Grades Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Khối lớp giảng dạy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="grades"
                            render={() => (
                                <FormItem>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                        {GRADES.map((grade) => (
                                            <FormField
                                                key={grade.value}
                                                control={form.control}
                                                name="grades"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={grade.value}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(grade.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, grade.value])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: any) => value !== grade.value
                                                                                )
                                                                            );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {grade.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Hourly Rate */}
                <Card>
                    <CardHeader>
                        <CardTitle>Học phí</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="hourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá/giờ (VND)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="100000"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Nền tảng giữ lại 20% phí dịch vụ.
                                    </FormDescription>
                                    <FormMessage />
                                    {field.value > 0 && (
                                        <div className="mt-2 p-3 bg-muted rounded-lg">
                                            <p className="text-sm">
                                                <span className="font-medium">Bạn nhận:</span>{" "}
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(field.value * 0.8)}
                                                /giờ
                                            </p>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Bio */}
                <Card>
                    <CardHeader>
                        <CardTitle>Giới thiệu bản thân</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Giới thiệu về kinh nghiệm và phong cách giảng dạy..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {field.value.length}/1000 ký tự
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Certificates Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chứng chỉ & Bằng cấp</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="certificates"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <CertificateUploader
                                            value={field.value || []}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Tải lên bằng cấp, chứng chỉ liên quan
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Bank Account */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="bankAccount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số tài khoản ngân hàng</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ví dụ: Vietcombank - 1234567890 - Nguyen Van A"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </Form>
    );
}

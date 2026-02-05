"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookingPaymentSchema, type CreateBookingPaymentInput } from "../schemas/booking-schema";
import { createBookingPayment } from "../actions/payment-actions";
import { getChildren } from "@/features/children/actions/child-actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, DollarSign, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface MultiDateBookingFormProps {
    tutorId: string;
    hourlyRate: number;
}

export function MultiDateBookingForm({ tutorId, hourlyRate }: MultiDateBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState<any[]>([]);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const form = useForm<CreateBookingPaymentInput>({
        resolver: zodResolver(createBookingPaymentSchema),
        defaultValues: {
            tutorId,
            childId: "",
            durationMinutes: 60,
            scheduledDates: [],
            timeSlot: "",
        },
    });

    useEffect(() => {
        loadChildren();
    }, []);

    useEffect(() => {
        form.setValue("scheduledDates", selectedDates);
    }, [selectedDates]);

    const loadChildren = async () => {
        const result = await getChildren();
        console.log({ result })
        if (result.success && result.data) {
            setChildren(result.data);
            // Auto-select first child if only one exists
            if (result.data.length === 1) {
                form.setValue("childId", result.data[0].id);
            }
        } else {
            toast.error(result.error || "Không thể tải danh sách con");
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;

        const dateString = date.toDateString();
        const isSelected = selectedDates.some((d) => d.toDateString() === dateString);

        if (isSelected) {
            setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateString));
        } else {
            setSelectedDates([...selectedDates, date]);
        }
    };

    const removeDate = (dateToRemove: Date) => {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateToRemove.toDateString()));
    };

    const calculateTotal = (duration: number, dateCount: number) => {
        return (hourlyRate * duration * dateCount) / 60;
    };

    const onSubmit = async (data: CreateBookingPaymentInput) => {
        if (!data.childId) {
            toast.error("Vui lòng chọn con");
            return;
        }

        if (selectedDates.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 ngày học");
            return;
        }

        if (!data.timeSlot) {
            toast.error("Vui lòng chọn giờ học");
            return;
        }

        // Build checkout URL with query params
        const params = new URLSearchParams({
            childId: data.childId,
            tutorId: data.tutorId,
            dates: selectedDates.map(d => d.toISOString()).join(','),
            time: data.timeSlot,
            duration: data.durationMinutes.toString(),
            ...(data.notes && { notes: data.notes }),
        });

        // Redirect to checkout page
        router.push(`/bookings/checkout?${params.toString()}`);
    };

    const watchDuration = form.watch("durationMinutes");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đặt lịch học nhiều ngày</CardTitle>
                <CardDescription>
                    Chọn nhiều ngày để đặt lịch học với gia sư cùng một lúc
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Child Selection */}
                        <FormField
                            control={form.control}
                            name="childId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chọn con</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn con để đặt lịch" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {children.length === 0 ? (
                                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                    Chưa có profile con. Vui lòng tạo profile con trước.
                                                </div>
                                            ) : (
                                                children.map((child) => (
                                                    <SelectItem key={child.id} value={child.id}>
                                                        {child.name} - Lớp {child.grade}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {children.length === 0 && (
                                            <span className="text-orange-600">
                                                Bạn cần tạo profile con trước khi đặt lịch.{" "}
                                                <a href="/dashboard/children" className="underline hover:text-orange-700">
                                                    Tạo profile con
                                                </a>
                                            </span>
                                        )}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Multiple Date Selection */}
                        <FormField
                            control={form.control}
                            name="scheduledDates"
                            render={() => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Chọn các ngày học</FormLabel>
                                    <FormDescription className="text-sm">
                                        Click vào nhiều ngày để chọn. Click lại để bỏ chọn.
                                    </FormDescription>
                                    <Calendar
                                        mode="multiple"
                                        selected={selectedDates}
                                        onSelect={(dates) => {
                                            if (dates) {
                                                setSelectedDates(dates);
                                            }
                                        }}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        className="rounded-md border"
                                    />
                                    {selectedDates.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">
                                                Đã chọn {selectedDates.length} ngày:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDates
                                                    .sort((a, b) => a.getTime() - b.getTime())
                                                    .map((date) => (
                                                        <Badge
                                                            key={date.toISOString()}
                                                            variant="secondary"
                                                            className="gap-1"
                                                        >
                                                            {format(date, "dd/MM/yyyy", { locale: vi })}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDate(date)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Time Slot Selection */}
                        <FormField
                            control={form.control}
                            name="timeSlot"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giờ học</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn giờ học" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => (
                                                <SelectItem key={hour} value={`${hour}:00`}>
                                                    {hour}:00
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Tất cả các buổi học sẽ diễn ra vào cùng giờ này
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duration Selection */}
                        <FormField
                            control={form.control}
                            name="durationMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thời lượng mỗi buổi</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn thời lượng" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="60">1 giờ</SelectItem>
                                            <SelectItem value="90">1.5 giờ</SelectItem>
                                            <SelectItem value="120">2 giờ</SelectItem>
                                            <SelectItem value="180">3 giờ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Thêm ghi chú cho gia sư..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Ghi chú này sẽ áp dụng cho tất cả các buổi học
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price Summary */}
                        {watchDuration && selectedDates.length > 0 && (
                            <Alert>
                                <DollarSign className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span>Giá/giờ:</span>
                                            <span className="font-semibold">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(hourlyRate)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Thời lượng/buổi:</span>
                                            <span className="font-semibold">{watchDuration} phút</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Số buổi:</span>
                                            <span className="font-semibold">{selectedDates.length} buổi</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Giá/buổi:</span>
                                            <span className="font-semibold">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format((hourlyRate * watchDuration) / 60)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                            <span>Tổng cộng:</span>
                                            <span className="text-primary">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(calculateTotal(watchDuration, selectedDates.length))}
                                            </span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || selectedDates.length === 0}>
                            {loading
                                ? "Đang xử lý..."
                                : selectedDates.length === 0
                                    ? "Chọn ngày để tiếp tục"
                                    : `Tiếp tục thanh toán ${selectedDates.length} buổi học`}
                        </Button>
                        {selectedDates.length > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                Bạn sẽ được chuyển đến trang thanh toán
                            </p>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

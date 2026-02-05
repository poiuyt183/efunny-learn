"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookingSchema, type CreateBookingInput } from "../schemas/booking-schema";
import { createBooking } from "../actions/booking-actions";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookingFormProps {
    tutorId: string;
    hourlyRate: number;
}

export function BookingForm({ tutorId, hourlyRate }: BookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState<any[]>([]);
    const [selectedDuration, setSelectedDuration] = useState(60);

    const form = useForm<CreateBookingInput>({
        resolver: zodResolver(createBookingSchema),
        defaultValues: {
            tutorId,
            durationMinutes: 60,
        },
    });

    useEffect(() => {
        loadChildren();
    }, []);

    console.log({ children })


    const loadChildren = async () => {
        const result = await getChildren();
        console.log({ result })
        if (result.success && result.data) {
            setChildren(result.data);
        }
    };

    const calculateTotal = (duration: number) => {
        return (hourlyRate * duration) / 60;
    };

    const onSubmit = async (data: CreateBookingInput) => {
        setLoading(true);

        const result = await createBooking(data);

        if (result.success) {
            toast.success("Đặt lịch thành công!");
            router.push("/dashboard/bookings");
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }

        setLoading(false);
    };

    const watchDuration = form.watch("durationMinutes");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đặt lịch học</CardTitle>
                <CardDescription>
                    Chọn thời gian và thông tin để đặt lịch học với gia sư
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
                                            {children.map((child) => (
                                                <SelectItem key={child.id} value={child.id}>
                                                    {child.name} - Lớp {child.grade}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date Selection */}
                        <FormField
                            control={form.control}
                            name="scheduledAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Ngày học</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP 'lúc' HH:mm", { locale: vi })
                                                    ) : (
                                                        <span>Chọn ngày và giờ</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                            <div className="p-3 border-t">
                                                <FormLabel className="text-sm mb-2 block">Chọn giờ</FormLabel>
                                                <Select
                                                    onValueChange={(time) => {
                                                        if (field.value) {
                                                            const [hours, minutes] = time.split(":").map(Number);
                                                            const newDate = new Date(field.value);
                                                            newDate.setHours(hours, minutes, 0, 0);
                                                            field.onChange(newDate);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn giờ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => (
                                                            <SelectItem key={hour} value={`${hour}:00`}>
                                                                {hour}:00
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
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
                                    <FormLabel>Thời lượng</FormLabel>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price Summary */}
                        {watchDuration && (
                            <Alert>
                                <DollarSign className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span>Giá giờ:</span>
                                            <span className="font-semibold">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(hourlyRate)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Thời lượng:</span>
                                            <span className="font-semibold">{watchDuration} phút</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                            <span>Tổng cộng:</span>
                                            <span className="text-primary">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(calculateTotal(watchDuration))}
                                            </span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

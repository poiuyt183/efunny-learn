"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    Check,
    X as XIcon,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek, addDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateBookingStatus, rejectBookingAsTutor } from "@/features/bookings/actions/booking-actions";
import { toast } from "sonner";

type BookingStatus = "PENDING_PAYMENT" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

interface Booking {
    id: string;
    scheduledAt: Date | string;
    durationMinutes: number;
    totalAmount: number;
    platformFee: number;
    status: BookingStatus;
    notes: string | null;
    child: {
        name: string;
        grade: number;
        user: {
            name: string;
            email: string;
            image: string | null;
        };
    };
}

interface TutorScheduleCalendarProps {
    bookings: Booking[];
}

const STATUS_CONFIG = {
    PENDING_PAYMENT: { label: "Chờ thanh toán", color: "bg-orange-500 text-white", textColor: "text-orange-600" },
    PENDING: { label: "Chờ xác nhận", color: "bg-yellow-500 text-white", textColor: "text-yellow-600" },
    CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-500 text-white", textColor: "text-blue-600" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-500 text-white", textColor: "text-green-600" },
    CANCELLED: { label: "Đã hủy", color: "bg-gray-500 text-white", textColor: "text-gray-600" },
    REFUNDED: { label: "Đã hoàn tiền", color: "bg-purple-500 text-white", textColor: "text-purple-600" },
};

export function TutorScheduleCalendar({ bookings }: TutorScheduleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const normalizedBookings = useMemo(() =>
        bookings.map(booking => ({
            ...booking,
            scheduledAt: typeof booking.scheduledAt === 'string'
                ? parseISO(booking.scheduledAt)
                : booking.scheduledAt
        })),
        [bookings]
    );

    const filteredBookings = useMemo(() => {
        if (statusFilter === "all") return normalizedBookings;
        return normalizedBookings.filter(b => b.status === statusFilter);
    }, [normalizedBookings, statusFilter]);

    const selectedDateBookings = useMemo(() => {
        if (!selectedDate) return [];
        return filteredBookings.filter(booking =>
            isSameDay(booking.scheduledAt, selectedDate)
        );
    }, [filteredBookings, selectedDate]);

    const monthBookings = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return filteredBookings.filter(booking => {
            const bookingDate = booking.scheduledAt;
            return bookingDate >= start && bookingDate <= end;
        });
    }, [filteredBookings, currentDate]);

    const weekBookings = useMemo(() => {
        const start = startOfWeek(currentDate, { locale: vi });
        const end = endOfWeek(currentDate, { locale: vi });
        return filteredBookings.filter(booking => {
            const bookingDate = booking.scheduledAt;
            return bookingDate >= start && bookingDate <= end;
        });
    }, [filteredBookings, currentDate]);

    const bookedDates = useMemo(() => {
        return filteredBookings.map(booking => booking.scheduledAt);
    }, [filteredBookings]);

    const calculateEarnings = (bookingsList: Booking[]) => {
        return bookingsList
            .filter(b => b.status === "COMPLETED")
            .reduce((sum, b) => sum + (b.totalAmount - b.platformFee), 0);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tháng này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthBookings.length}</div>
                        <p className="text-xs text-muted-foreground">buổi học</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hoàn thành
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {monthBookings.filter(b => b.status === "COMPLETED").length}
                        </div>
                        <p className="text-xs text-muted-foreground">buổi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Sắp tới
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {monthBookings.filter(b =>
                                (b.status === "PENDING" || b.status === "CONFIRMED") &&
                                b.scheduledAt >= new Date()
                            ).length}
                        </div>
                        <p className="text-xs text-muted-foreground">buổi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Thu nhập tháng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat("vi-VN", {
                                notation: "compact",
                                compactDisplay: "short",
                            }).format(calculateEarnings(monthBookings))}
                        </div>
                        <p className="text-xs text-muted-foreground">VND</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
                        Hôm nay
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium ml-2">
                        {format(currentDate, "MMMM yyyy", { locale: vi })}
                    </span>
                </div>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="month">Tháng</TabsTrigger>
                    <TabsTrigger value="week">Tuần</TabsTrigger>
                    <TabsTrigger value="list">Danh sách</TabsTrigger>
                </TabsList>

                <TabsContent value="month" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardContent className="pt-6">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    month={currentDate}
                                    onMonthChange={setCurrentDate}
                                    locale={vi}
                                    modifiers={{ booked: bookedDates }}
                                    modifiersClassNames={{ booked: "bg-primary/10 font-semibold" }}
                                    className="rounded-md border"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedDateBookings.length} buổi học
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {selectedDateBookings.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Không có buổi học nào
                                    </p>
                                ) : (
                                    selectedDateBookings
                                        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                                        .map((booking) => (
                                            <BookingItem key={booking.id} booking={booking} />
                                        ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="week" className="space-y-4">
                    <p className="text-muted-foreground text-sm">Chức năng đang phát triển...</p>
                </TabsContent>

                <TabsContent value="list" className="space-y-4">
                    <p className="text-muted-foreground text-sm">Chức năng đang phát triển...</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function BookingItem({ booking }: { booking: Booking }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const status = STATUS_CONFIG[booking.status];
    const isPending = booking.status === "PENDING";
    const isConfirmed = booking.status === "CONFIRMED";

    const handleConfirm = async () => {
        setLoading(true);
        const result = await updateBookingStatus(booking.id, "CONFIRMED");
        if (result.success) {
            toast.success("Đã xác nhận lịch học");
            router.refresh();
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }
        setLoading(false);
    };

    const handleReject = async () => {
        setLoading(true);
        const result = await rejectBookingAsTutor(booking.id);
        if (result.success) {
            toast.success("Đã từ chối lịch học");
            router.refresh();
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }
        setLoading(false);
    };

    const handleComplete = async () => {
        setLoading(true);
        const result = await updateBookingStatus(booking.id, "COMPLETED");
        if (result.success) {
            toast.success("Đã đánh dấu hoàn thành");
            router.refresh();
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }
        setLoading(false);
    };

    return (
        <div className="p-3 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                        {format(booking.scheduledAt, "HH:mm", { locale: vi })}
                    </span>
                </div>
                <Badge className={status.color} variant="secondary">
                    {status.label}
                </Badge>
            </div>

            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {booking.child.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{booking.child.name}</p>
                    <p className="text-xs text-muted-foreground">
                        Lớp {booking.child.grade} • {booking.durationMinutes} phút
                    </p>
                </div>
            </div>

            {booking.notes && (
                <p className="text-xs text-muted-foreground italic line-clamp-2">
                    {booking.notes}
                </p>
            )}

            {isPending && (
                <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="default" className="flex-1" onClick={handleConfirm} disabled={loading}>
                        <Check className="h-3 w-3 mr-1" />
                        Xác nhận
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="flex-1" disabled={loading}>
                                <XIcon className="h-3 w-3 mr-1" />
                                Từ chối
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Từ chối lịch học?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc muốn từ chối lịch học này? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReject}>Từ chối</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {isConfirmed && new Date(booking.scheduledAt) < new Date() && (
                <div className="pt-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="default" className="w-full" disabled={loading}>
                                <Check className="h-3 w-3 mr-1" />
                                Đánh dấu hoàn thành
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận hoàn thành?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Xác nhận rằng buổi học này đã hoàn thành. Điều này sẽ cập nhật thống kê của bạn.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleComplete}>Xác nhận</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
}

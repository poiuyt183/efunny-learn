"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Calendar, Clock, User, GraduationCap, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cancelBooking } from "../actions/booking-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

interface BookingCardProps {
    booking: {
        id: string;
        scheduledAt: Date;
        durationMinutes: number;
        totalAmount: number;
        status: BookingStatus;
        notes: string | null;
        child: {
            name: string;
            grade: number;
        };
        tutor: {
            subjects: string[];
            user: {
                name: string;
                image: string | null;
            };
        };
    };
}

const STATUS_CONFIG = {
    PENDING: { label: "Chờ xác nhận", color: "bg-yellow-500" },
    CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-500" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-500" },
    CANCELLED: { label: "Đã hủy", color: "bg-gray-500" },
    REFUNDED: { label: "Đã hoàn tiền", color: "bg-purple-500" },
};

export function BookingCard({ booking }: BookingCardProps) {
    const router = useRouter();
    const status = STATUS_CONFIG[booking.status];
    const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

    const handleCancel = async () => {
        const result = await cancelBooking(booking.id);

        if (result.success) {
            toast.success("Hủy lịch thành công");
            router.refresh();
        } else {
            toast.error(result.error || "Có lỗi xảy ra");
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Tutor Avatar */}
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {booking.tutor.user.name.charAt(0)}
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg">
                                {booking.tutor.user.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                {booking.child.name} - Lớp {booking.child.grade}
                            </div>
                        </div>
                    </div>

                    <Badge className={status.color}>{status.label}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                        {format(new Date(booking.scheduledAt), "EEEE, dd/MM/yyyy 'lúc' HH:mm", {
                            locale: vi,
                        })}
                    </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.durationMinutes} phút</span>
                </div>

                {/* Subjects */}
                <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                        {booking.tutor.subjects.slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        <span className="font-semibold">Ghi chú:</span> {booking.notes}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-semibold">Tổng tiền:</span>
                    <span className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(booking.totalAmount)}
                    </span>
                </div>

                {/* Actions */}
                {canCancel && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" size="sm">
                                <X className="w-4 h-4 mr-2" />
                                Hủy lịch
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận hủy lịch</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn hủy lịch học này không? Hành động này không
                                    thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Không</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancel}>
                                    Có, hủy lịch
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardContent>
        </Card>
    );
}

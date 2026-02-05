"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, Copy, AlertCircle, Calendar, Clock, User, DollarSign } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingInfo {
    childId: string;
    childName: string;
    childGrade: number;
    tutorId: string;
    tutorName: string;
    scheduledDates: Date[];
    timeSlot: string;
    durationMinutes: number;
    notes: string;
    hourlyRate: number;
    amountPerSession: number;
    totalAmount: number;
}

interface PaymentData {
    orderId: string;
    amount: number;
    qrCodeUrl: string;
    bankAccount: string;
    bankName: string;
    description: string;
    bookingCount: number;
    bookingIds: string[];
    childName: string;
    tutorName: string;
    durationMinutes: number;
    amountPerSession: number;
}

interface BookingCheckoutClientProps {
    bookingInfo: BookingInfo;
}

export function BookingCheckoutClient({ bookingInfo }: BookingCheckoutClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "checking" | "success" | "error">("idle");
    const [countdown, setCountdown] = useState(0);

    const handleCreatePayment = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/bookings/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    childId: bookingInfo.childId,
                    tutorId: bookingInfo.tutorId,
                    scheduledDates: bookingInfo.scheduledDates.map(d => d.toISOString()),
                    timeSlot: bookingInfo.timeSlot,
                    durationMinutes: bookingInfo.durationMinutes,
                    notes: bookingInfo.notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create payment");
            }

            setPaymentData(data);
            setPaymentStatus("pending");
            setCountdown(5);
            toast.success("QR Code đã được tạo. Vui lòng quét mã để thanh toán.");
        } catch (error) {
            toast.error("Không thể tạo thanh toán. Vui lòng thử lại.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!paymentData || paymentStatus === "success" || paymentStatus === "error") return;

        if (paymentStatus === "pending" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (paymentStatus === "pending" && countdown === 0) {
            setPaymentStatus("checking");
        }

        if (paymentStatus !== "checking") return;

        const checkPayment = async () => {
            try {
                const res = await fetch(`/api/bookings/check-payment?orderId=${paymentData.orderId}`);
                const data = await res.json();

                if (data.status === "COMPLETED") {
                    setPaymentStatus("success");
                    toast.success("Thanh toán thành công! Đang chuyển hướng...");
                    setTimeout(() => {
                        router.push("/dashboard/bookings?success=true");
                        router.refresh();
                    }, 2000);
                } else if (data.status === "FAILED" || data.status === "CANCELLED") {
                    setPaymentStatus("error");
                    toast.error("Thanh toán thất bại. Vui lòng thử lại.");
                }
            } catch (error) {
                console.error("Check payment error:", error);
            }
        };

        checkPayment();
        const interval = setInterval(checkPayment, 3000);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (paymentStatus === "checking") {
                toast.warning("Vui lòng kiểm tra lại trạng thái thanh toán.");
            }
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [paymentStatus, paymentData, router, countdown]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Đã copy ${label}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link href="/dashboard/tutors">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            </Link>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Thanh toán buổi học</h1>
                <p className="text-muted-foreground">
                    Hoàn tất thanh toán để xác nhận đặt lịch học
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin đặt lịch</CardTitle>
                        <CardDescription>Chi tiết các buổi học</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Student & Tutor Info */}
                        <div className="space-y-3 border-b pb-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Học sinh:</span>
                                <span className="font-medium">{bookingInfo.childName}</span>
                                <Badge variant="outline" className="ml-auto">Lớp {bookingInfo.childGrade}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Gia sư:</span>
                                <span className="font-medium">{bookingInfo.tutorName}</span>
                            </div>
                        </div>

                        {/* Schedule Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {bookingInfo.scheduledDates.length} buổi học
                                </span>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1 pl-6">
                                {bookingInfo.scheduledDates
                                    .sort((a, b) => a.getTime() - b.getTime())
                                    .map((date, index) => (
                                        <div key={index} className="text-sm text-muted-foreground">
                                            {format(date, "EEEE, dd/MM/yyyy", { locale: vi })} - {bookingInfo.timeSlot}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Thời lượng:</span>
                            <span className="font-medium">{bookingInfo.durationMinutes} phút/buổi</span>
                        </div>

                        {bookingInfo.notes && (
                            <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm font-medium mb-1">Ghi chú</p>
                                <p className="text-sm text-muted-foreground">{bookingInfo.notes}</p>
                            </div>
                        )}

                        {/* Pricing */}
                        <div className="space-y-2 border-t pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Giá/giờ</span>
                                <span>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(bookingInfo.hourlyRate)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Giá/buổi</span>
                                <span>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(bookingInfo.amountPerSession)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Số buổi</span>
                                <span>{bookingInfo.scheduledDates.length} buổi</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                                <span>Tổng cộng</span>
                                <span className="text-primary">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(bookingInfo.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Section */}
                <div className="space-y-6">
                    {!paymentData ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Phương thức thanh toán</CardTitle>
                                <CardDescription>
                                    Chuyển khoản ngân hàng qua QR Code
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={handleCreatePayment}
                                    disabled={loading}
                                    className="w-full"
                                    size="lg"
                                >
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Tạo mã QR thanh toán
                                </Button>

                                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                                    <p className="font-medium">📝 Lưu ý:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Thanh toán sẽ được xác nhận tự động trong vài giây</li>
                                        <li>Gia sư sẽ nhận được thông báo và xác nhận lịch học</li>
                                        <li>Bạn có thể hủy lịch miễn phí trước 24h</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Quét mã QR để thanh toán</span>
                                    {paymentStatus === "success" && (
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    )}
                                    {paymentStatus === "checking" && (
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {paymentStatus === "pending" && countdown > 0 && (
                                        <span>Hệ thống sẽ tự động kiểm tra sau {countdown}s</span>
                                    )}
                                    {paymentStatus === "checking" && (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang kiểm tra thanh toán...
                                        </span>
                                    )}
                                    {paymentStatus === "success" && (
                                        <span className="text-green-600 font-medium">
                                            Thanh toán thành công!
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-lg border-2 border-primary">
                                        <Image
                                            src={paymentData.qrCodeUrl}
                                            alt="QR Code thanh toán"
                                            width={250}
                                            height={250}
                                            className="rounded"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Ngân hàng</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{paymentData.bankName}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(paymentData.bankName, "tên ngân hàng")}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Số tài khoản</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium font-mono">{paymentData.bankAccount}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(paymentData.bankAccount, "số tài khoản")}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Số tiền</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-primary text-lg">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(paymentData.amount)}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(paymentData.amount.toString(), "số tiền")}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Nội dung chuyển khoản</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium font-mono text-sm break-all">{paymentData.description}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(paymentData.description, "nội dung")}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                                        <p>Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Home, Calendar } from "lucide-react";
import { cancelBookingPayment } from "@/features/bookings/actions/payment-actions";

function PaymentReturnContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
    const [message, setMessage] = useState("Đang xác nhận thanh toán...");
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            // Get params from URL
            // SEPay returns: ?status=success&orderId=BOOKxxx&transactionId=xxx
            const statusParam = searchParams.get("status");
            const orderIdParam = searchParams.get("orderId");
            const transactionId = searchParams.get("transactionId");

            setOrderId(orderIdParam);

            if (statusParam === "success") {
                // Payment successful - webhook will handle the confirmation
                setStatus("success");
                setMessage("Thanh toán thành công! Đang chờ gia sư xác nhận lịch học.");

                // Redirect to bookings page after 3 seconds
                setTimeout(() => {
                    router.push("/dashboard/bookings");
                }, 3000);
            } else if (statusParam === "failed" || statusParam === "cancelled") {
                // Payment failed - cancel the bookings
                setStatus("failed");
                setMessage("Thanh toán không thành công. Vui lòng thử lại.");

                if (orderIdParam) {
                    // Cancel bookings
                    await cancelBookingPayment(orderIdParam);
                }
            } else {
                // Unknown status
                setStatus("failed");
                setMessage("Không thể xác định trạng thái thanh toán.");
            }
        };

        checkPaymentStatus();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === "processing" && (
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        )}
                        {status === "success" && (
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        )}
                        {status === "failed" && (
                            <XCircle className="h-16 w-16 text-destructive" />
                        )}
                    </div>
                    <CardTitle>
                        {status === "processing" && "Đang xử lý thanh toán"}
                        {status === "success" && "Thanh toán thành công"}
                        {status === "failed" && "Thanh toán thất bại"}
                    </CardTitle>
                    {orderId && (
                        <CardDescription className="text-xs mt-2">
                            Mã đơn hàng: {orderId}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant={status === "failed" ? "destructive" : "default"}>
                        <AlertDescription className="text-center">
                            {message}
                        </AlertDescription>
                    </Alert>

                    {status === "success" && (
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>✓ Thanh toán đã được xác nhận</p>
                            <p>✓ Lịch học đã được tạo</p>
                            <p>✓ Đang chờ gia sư xác nhận</p>
                            <p className="text-xs mt-4">
                                Bạn sẽ nhận được thông báo khi gia sư xác nhận lịch học.
                            </p>
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Một số lý do có thể khiến thanh toán thất bại:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Số dư tài khoản không đủ</li>
                                <li>Thông tin thanh toán không chính xác</li>
                                <li>Hủy thanh toán</li>
                                <li>Lỗi kết nối</li>
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push("/")}
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Trang chủ
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => router.push("/dashboard/bookings")}
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Lịch học
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function BookingPaymentReturnPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="max-w-md w-full">
                    <CardContent className="py-12 text-center">
                        <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                    </CardContent>
                </Card>
            </div>
        }>
            <PaymentReturnContent />
        </Suspense>
    );
}

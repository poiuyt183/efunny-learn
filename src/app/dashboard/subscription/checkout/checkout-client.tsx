"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Shield, Clock, Loader2, CheckCircle2, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface TierInfo {
    name: string;
    displayName: string;
    price: number;
    description: string;
    features: string[];
}

interface CheckoutClientProps {
    tier: "BASIC" | "PREMIUM";
    tierInfo: TierInfo;
    currentSubscription: any;
}

interface PaymentData {
    orderId: string;
    amount: number;
    qrCodeUrl: string;
    bankAccount: string;
    bankName: string;
    description: string;
    tier: string;
}

export function CheckoutClient({ tier, tierInfo, currentSubscription }: CheckoutClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "checking" | "success" | "error">("idle");
    const [countdown, setCountdown] = useState(0);

    // Tạo payment và lấy QR code
    const handleCreatePayment = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/subscription/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier }),
            });

            const data = await res.json();
            console.log({ data })

            if (!res.ok) {
                throw new Error(data.error || "Failed to create payment");
            }

            setPaymentData(data);
            setPaymentStatus("pending");
            setCountdown(5); // Bắt đầu check sau 5 giây
            toast.success("QR Code đã được tạo. Vui lòng quét mã để thanh toán.");
        } catch (error) {
            toast.error("Không thể tạo thanh toán. Vui lòng thử lại.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Auto check payment status
    useEffect(() => {
        if (!paymentData || paymentStatus === "success" || paymentStatus === "error") return;

        // Countdown trước khi check
        if (paymentStatus === "pending" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        // Start checking khi countdown = 0 hoặc đã ở trạng thái checking
        if (paymentStatus === "pending" && countdown === 0) {
            setPaymentStatus("checking");
        }

        if (paymentStatus !== "checking") return;

        console.log("🔄 Checking payment status for order:", paymentData.orderId);

        const checkPayment = async () => {
            try {
                const res = await fetch(`/api/subscription/check-payment?orderId=${paymentData.orderId}`);
                const data = await res.json();

                console.log("📊 Payment status response:", data);

                if (data.status === "SUCCESS") {
                    setPaymentStatus("success");
                    toast.success("Thanh toán thành công! Đang chuyển hướng...");
                    setTimeout(() => {
                        router.push("/dashboard/subscription?success=true");
                        router.refresh();
                    }, 2000);
                } else if (data.status === "FAILED") {
                    setPaymentStatus("error");
                    toast.error("Thanh toán thất bại. Vui lòng thử lại.");
                } else {
                    console.log("⏳ Payment still pending...");
                }
            } catch (error) {
                console.error("Check payment error:", error);
            }
        };

        // Check ngay lập tức
        checkPayment();

        // Sau đó check mỗi 3 giây
        const interval = setInterval(checkPayment, 3000);

        // Timeout sau 10 phút
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Button */}
            <Link href="/dashboard/subscription">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
                <p className="text-muted-foreground">
                    Hoàn tất thanh toán để kích hoạt gói đăng ký
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin đơn hàng</CardTitle>
                        <CardDescription>Chi tiết gói đăng ký của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Plan Details */}
                        <div className="border-b pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{tierInfo.displayName}</h3>
                                <Badge>{tier}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {tierInfo.description}
                            </p>

                            <ul className="space-y-2">
                                {tierInfo.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Giá gói</span>
                                <span>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(tierInfo.price)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Thời hạn</span>
                                <span>1 tháng</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                                <span>Tổng cộng</span>
                                <span className="text-primary">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(tierInfo.price)}
                                </span>
                            </div>
                        </div>

                        {/* Current Plan Info */}
                        {currentSubscription && (
                            <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm font-medium mb-1">Gói hiện tại</p>
                                <p className="text-sm text-muted-foreground">
                                    {currentSubscription.tier} - {currentSubscription.status}
                                </p>
                            </div>
                        )}
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

                                {/* Security Info */}
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="font-medium text-sm">Bảo mật tuyệt đối</h5>
                                            <p className="text-xs text-muted-foreground">
                                                Thông tin được mã hóa và bảo vệ
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="font-medium text-sm">Kích hoạt ngay lập tức</h5>
                                            <p className="text-xs text-muted-foreground">
                                                Gói đăng ký sẽ được kích hoạt tự động sau khi thanh toán
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* QR Code */}
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
                                        {paymentStatus === "pending" && countdown === 0 && (
                                            <span>Vui lòng hoàn tất thanh toán</span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* QR Code Image */}
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

                                    {/* Bank Info */}
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
                                                <p className="font-medium font-mono text-sm">{paymentData.description}</p>
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

                                    {/* Warning */}
                                    <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                                            <p>Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Terms */}
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">
                                Bằng cách thanh toán, bạn đồng ý với{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Điều khoản dịch vụ
                                </Link>{" "}
                                và{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Chính sách bảo mật
                                </Link>{" "}
                                của chúng tôi.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

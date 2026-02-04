import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { getPaymentHistory } from "@/features/subscription/actions/subscription-actions";
import Link from "next/link";

export default async function PaymentHistoryPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const paymentsResult = await getPaymentHistory();
    const payments = paymentsResult.success ? (paymentsResult.data || []) : [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Thành công
                    </Badge>
                );
            case "FAILED":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Thất bại
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Đang xử lý
                    </Badge>
                );
            case "REFUNDED":
                return (
                    <Badge variant="outline">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Đã hoàn tiền
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard/subscription">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Lịch sử thanh toán</h1>
                <p className="text-muted-foreground mt-1">
                    Xem tất cả các giao dịch thanh toán của bạn
                </p>
            </div>

            {/* Payment List */}
            {payments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch nào</h3>
                        <p className="text-muted-foreground mb-6">
                            Lịch sử thanh toán của bạn sẽ hiển thị ở đây
                        </p>
                        <Link href="/dashboard/subscription">
                            <Button>Nâng cấp gói ngay</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <Card key={payment.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">
                                            Gói {payment.tier}
                                        </CardTitle>
                                        <CardDescription>
                                            Mã giao dịch: {payment.vnpayTransactionId}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(payment.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Số tiền</p>
                                        <p className="font-bold text-lg">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(payment.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Ngân hàng</p>
                                        <p className="font-medium">
                                            {payment.vnpayBankCode || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Ngày thanh toán</p>
                                        <p className="font-medium">
                                            {payment.paidAt
                                                ? new Date(payment.paidAt).toLocaleDateString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "Chưa thanh toán"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                                        <p className="font-medium">
                                            {new Date(payment.createdAt).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Mã đơn hàng: {payment.vnpayOrderId}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

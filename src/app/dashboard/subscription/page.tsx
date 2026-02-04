import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, AlertCircle } from "lucide-react";
import { getCurrentSubscription } from "@/features/subscription/actions/subscription-actions";
import { TIER_PRICING } from "@/features/subscription/constants";
import { SubscriptionActions } from "@/features/subscription/components/subscription-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const TIERS = [
    {
        name: "FREE" as const,
        price: 0,
        description: "Dùng thử miễn phí",
        features: [
            "5 câu hỏi AI mỗi ngày",
            "1 profile con",
            "Tìm kiếm gia sư cơ bản",
        ],
    },
    {
        name: "BASIC" as const,
        price: TIER_PRICING.BASIC,
        description: "Phù hợp cho gia đình",
        features: [
            "50 câu hỏi AI mỗi ngày",
            "Tối đa 3 profiles con",
            "Tìm kiếm gia sư nâng cao",
            "Phân tích học tập cơ bản",
            "Hỗ trợ ưu tiên",
        ],
        popular: true,
    },
    {
        name: "PREMIUM" as const,
        price: TIER_PRICING.PREMIUM,
        description: "Trải nghiệm tốt nhất",
        features: [
            "Không giới hạn câu hỏi AI",
            "Không giới hạn profiles con",
            "Tìm kiếm gia sư cao cấp",
            "Phân tích học tập chi tiết",
            "Hỗ trợ 24/7",
            "Giảm giá đặt lịch gia sư 10%",
        ],
    },
];

export default async function SubscriptionPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string; code?: string }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const subscriptionResult = await getCurrentSubscription();
    const currentSubscription = subscriptionResult.success ? subscriptionResult.data : null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Success/Error Messages */}
            {params.success && (
                <Alert className="mb-6 border-green-500 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Thanh toán thành công! Gói đăng ký của bạn đã được nâng cấp.
                    </AlertDescription>
                </Alert>
            )}

            {params.error && (
                <Alert className="mb-6 border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {params.error === "payment_failed"
                            ? `Thanh toán thất bại (Mã lỗi: ${params.code || "unknown"}). Vui lòng thử lại.`
                            : params.error === "invalid_signature"
                                ? "Chữ ký không hợp lệ. Vui lòng liên hệ hỗ trợ."
                                : "Có lỗi xảy ra. Vui lòng thử lại sau."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Current Plan */}
            {currentSubscription && (
                <Card className="mb-8 border-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Gói hiện tại</CardTitle>
                                <CardDescription>
                                    Quản lý gói đăng ký của bạn
                                </CardDescription>
                            </div>
                            <Badge className="text-lg px-4 py-2">
                                {currentSubscription.tier}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                                <Badge variant={currentSubscription.status === "ACTIVE" ? "default" : "secondary"}>
                                    {currentSubscription.status === "ACTIVE" ? "Đang hoạt động" :
                                        currentSubscription.status === "CANCELLED" ? "Đã hủy" :
                                            currentSubscription.status === "PAST_DUE" ? "Quá hạn" : "Dùng thử"}
                                </Badge>
                            </div>
                            {currentSubscription.currentPeriodEnd && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Gia hạn vào</p>
                                    <p className="font-medium">
                                        {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Lịch sử thanh toán</p>
                                <Link href="/dashboard/subscription/history" className="text-primary hover:underline font-medium">
                                    Xem lịch sử →
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Chọn gói phù hợp cho bạn</h1>
                <p className="text-muted-foreground text-lg">
                    Nâng cấp để mở khóa nhiều tính năng hơn
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {TIERS.map((tier) => {
                    const isCurrentTier = currentSubscription?.tier === tier.name;
                    const canUpgrade = currentSubscription &&
                        ["FREE", "BASIC"].includes(currentSubscription.tier) &&
                        tier.name !== "FREE" &&
                        tier.name !== currentSubscription.tier;
                    // Downgrade is disabled - users can only upgrade or cancel
                    const canDowngrade = false;

                    return (
                        <Card
                            key={tier.name}
                            className={`relative ${tier.popular ? "border-primary border-2 shadow-lg" : ""
                                } ${isCurrentTier ? "border-green-500 border-2" : ""}`}
                        >
                            {tier.popular && !isCurrentTier && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Phổ biến nhất
                                    </Badge>
                                </div>
                            )}

                            {isCurrentTier && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-green-500">
                                        <Check className="w-3 h-3 mr-1" />
                                        Gói hiện tại
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                <CardDescription>{tier.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(tier.price)}
                                    </span>
                                    <span className="text-muted-foreground">/tháng</span>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <SubscriptionActions
                                    tier={tier.name}
                                    isCurrentTier={isCurrentTier}
                                    canUpgrade={Boolean(canUpgrade)}
                                    canDowngrade={canDowngrade}
                                    currentTier={currentSubscription?.tier as "FREE" | "BASIC" | "PREMIUM"}
                                />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Info */}
            <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>
                    Tất cả các gói đều có thể hủy bất kỳ lúc nào. Không có ràng buộc hợp đồng.
                </p>
            </div>
        </div>
    );
}

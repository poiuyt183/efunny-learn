import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

const TIERS = [
    {
        name: "FREE",
        price: 0,
        description: "Dùng thử miễn phí",
        features: [
            "5 câu hỏi AI mỗi ngày",
            "1 profile con",
            "Tìm kiếm gia sư cơ bản",
        ],
    },
    {
        name: "BASIC",
        price: 99000,
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
        name: "PREMIUM",
        price: 199000,
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

export default async function SubscriptionPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Chọn gói phù hợp cho bạn</h1>
                <p className="text-muted-foreground text-lg">
                    Nâng cấp để mở khóa nhiều tính năng hơn
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {TIERS.map((tier) => (
                    <Card
                        key={tier.name}
                        className={`relative ${tier.popular ? "border-primary border-2 shadow-lg" : ""
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-primary">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Phổ biến nhất
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

                            <Button
                                className="w-full"
                                variant={tier.popular ? "default" : "outline"}
                                disabled={tier.name === "FREE"}
                            >
                                {tier.name === "FREE" ? "Gói hiện tại" : "Nâng cấp"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
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

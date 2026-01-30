"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface PlanProps {
    name: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    tier: "BASIC" | "PREMIUM";
    recommended?: boolean;
}

export function PlanCard({
    name,
    price,
    originalPrice,
    description,
    features,
    tier,
    recommended,
}: PlanProps) {
    const [loading, setLoading] = useState(false);
    const _router = useRouter();

    const handleSubscribe = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/subscription/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            toast.error("Không thể tạo thanh toán. Vui lòng thử lại sau.");
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <Card
            className={`relative flex flex-col ${recommended ? "border-green-500 shadow-lg scale-105" : "border-gray-200"
                }`}
        >
            {recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    Gói phổ biến nhất
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-2xl">{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="mb-6">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-gray-500 text-sm">/tháng</span>
                    {originalPrice && (
                        <div className="text-gray-400 line-through text-sm mt-1">
                            {originalPrice}
                        </div>
                    )}
                </div>
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className={`w-full ${recommended ? "bg-green-600 hover:bg-green-700" : ""}`}
                    onClick={handleSubscribe}
                    disabled={loading}
                >
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                </Button>
            </CardFooter>
        </Card>
    );
}

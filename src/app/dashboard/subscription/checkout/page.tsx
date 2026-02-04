import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCurrentSubscription } from "@/features/subscription/actions/subscription-actions";
import { TIER_PRICING } from "@/features/subscription/constants";
import { CheckoutClient } from "./checkout-client";

const TIER_INFO = {
    BASIC: {
        name: "BASIC",
        displayName: "Gói Basic",
        price: TIER_PRICING.BASIC,
        description: "Phù hợp cho gia đình",
        features: [
            "50 câu hỏi AI mỗi ngày",
            "Tối đa 3 profiles con",
            "Tìm kiếm gia sư nâng cao",
            "Phân tích học tập cơ bản",
            "Hỗ trợ ưu tiên",
        ],
    },
    PREMIUM: {
        name: "PREMIUM",
        displayName: "Gói Premium",
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
};

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ tier?: string }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const tier = params.tier as "BASIC" | "PREMIUM";

    if (!tier || !["BASIC", "PREMIUM"].includes(tier)) {
        redirect("/dashboard/subscription");
    }

    const subscriptionResult = await getCurrentSubscription();
    const currentSubscription = subscriptionResult.success ? subscriptionResult.data : null;

    const tierInfo = TIER_INFO[tier];

    return (
        <CheckoutClient
            tier={tier}
            tierInfo={tierInfo}
            currentSubscription={currentSubscription}
        />
    );
}

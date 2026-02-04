export type SubscriptionTier = "FREE" | "BASIC" | "PREMIUM";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING";

export const TIER_LIMITS = {
    FREE: {
        dailyQuestions: 5,
        maxChildren: 1,
        features: ["Tìm kiếm gia sư cơ bản"],
    },
    BASIC: {
        dailyQuestions: 50,
        maxChildren: 3,
        features: [
            "Tìm kiếm gia sư nâng cao",
            "Phân tích học tập cơ bản",
            "Hỗ trợ ưu tiên",
        ],
    },
    PREMIUM: {
        dailyQuestions: Infinity,
        maxChildren: Infinity,
        features: [
            "Tìm kiếm gia sư cao cấp",
            "Phân tích học tập chi tiết",
            "Hỗ trợ 24/7",
            "Giảm giá 10% đặt lịch gia sư",
        ],
    },
};

export const TIER_PRICING = {
    BASIC: 99000,
    PREMIUM: 199000,
};

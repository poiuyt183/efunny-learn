import Link from "next/link";
import { Check } from "lucide-react";

export function PricingSection() {
    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h2
                    className="font-landing-heading text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: "var(--color-clay-text)" }}
                >
                    Bảng Giá Minh Bạch
                </h2>
                <p
                    className="font-landing-body text-xl max-w-2xl mx-auto"
                    style={{ color: "var(--color-clay-text-muted)" }}
                >
                    Lựa chọn phù hợp với nhu cầu của bạn
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Parent/Student Card */}
                <div className="clay-card p-8 relative overflow-hidden animate-scale-in">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5]/10 rounded-full blur-3xl" />

                    <div className="relative">
                        <div className="text-center mb-8">
                            <span className="text-5xl mb-4 block">👨‍👩‍👧‍👦</span>
                            <h3
                                className="font-landing-heading text-3xl font-bold mb-2"
                                style={{ color: "var(--color-clay-text)" }}
                            >
                                Funny Learn
                            </h3>
                            <p
                                className="font-landing-body"
                                style={{ color: "var(--color-clay-text-muted)" }}
                            >
                                Dành cho Học sinh
                            </p>
                        </div>

                        <div className="space-y-6 mb-8">
                            {/* Basic Plan */}
                            <div className="p-6 bg-white rounded-xl border-3 border-[#4F46E5]/20">
                                <div className="flex items-baseline justify-between mb-4">
                                    <span className="font-landing-heading text-lg font-semibold" style={{ color: "var(--color-clay-text)" }}>
                                        Basic
                                    </span>
                                    <div>
                                        <span className="font-landing-heading text-3xl font-bold" style={{ color: "var(--color-clay-primary)" }}>
                                            99k
                                        </span>
                                        <span className="font-landing-body text-sm" style={{ color: "var(--color-clay-text-muted)" }}>
                                            /tháng
                                        </span>
                                    </div>
                                </div>
                                <ul className="space-y-2 font-landing-body text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#4F46E5]" />
                                        <span>AI Companion cơ bản</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#4F46E5]" />
                                        <span>10 câu hỏi/ngày</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Premium Plan */}
                            <div className="p-6 bg-gradient-to-br from-[#4F46E5]/10 to-[#818CF8]/10 rounded-xl border-3 border-[#4F46E5]/40 relative">
                                <div className="absolute -top-3 right-4 bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full font-landing-body">
                                    PHỔ BIẾN
                                </div>
                                <div className="flex items-baseline justify-between mb-4">
                                    <span className="font-landing-heading text-lg font-semibold" style={{ color: "var(--color-clay-text)" }}>
                                        Premium
                                    </span>
                                    <div>
                                        <span className="font-landing-heading text-3xl font-bold" style={{ color: "var(--color-clay-primary)" }}>
                                            199k
                                        </span>
                                        <span className="font-landing-body text-sm" style={{ color: "var(--color-clay-text-muted)" }}>
                                            /tháng
                                        </span>
                                    </div>
                                </div>
                                <ul className="space-y-2 font-landing-body text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#4F46E5]" />
                                        <span>Không giới hạn câu hỏi</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#4F46E5]" />
                                        <span>Linh Thú cao cấp</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#4F46E5]" />
                                        <span>Báo cáo chi tiết</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#4F46E5]" />
                                        <span>Ưu tiên support</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Link
                            href="/register"
                            className="clay-button w-full text-center font-landing-body block"
                        >
                            Dùng thử miễn phí 7 ngày
                        </Link>
                        <p className="text-center font-landing-body text-xs mt-2" style={{ color: "var(--color-clay-text-muted)" }}>
                            Không cần thẻ tín dụng
                        </p>
                    </div>
                </div>

                {/* Tutor Card */}
                <div className="clay-card p-8 relative overflow-hidden animate-scale-in delay-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/10 rounded-full blur-3xl" />

                    <div className="relative">
                        <div className="text-center mb-8">
                            <span className="text-5xl mb-4 block">👨‍🏫</span>
                            <h3
                                className="font-landing-heading text-3xl font-bold mb-2"
                                style={{ color: "var(--color-clay-text)" }}
                            >
                                Funny Learn Connect
                            </h3>
                            <p
                                className="font-landing-body"
                                style={{ color: "var(--color-clay-text-muted)" }}
                            >
                                Dành cho Gia sư
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <span className="font-landing-heading text-5xl font-bold" style={{ color: "var(--color-clay-cta)" }}>
                                    15%
                                </span>
                                <p className="font-landing-body text-lg mt-2" style={{ color: "var(--color-clay-text)" }}>
                                    Hoa hồng mỗi buổi học
                                </p>
                            </div>

                            <ul className="space-y-4 font-landing-body">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-1" />
                                    <span>Nhận 10+ học sinh mỗi tuần</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-1" />
                                    <span>Báo cáo AI về năng lực học sinh</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-1" />
                                    <span>Lịch dạy linh hoạt, tự quản lý</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-1" />
                                    <span>Rút tiền nhanh chóng</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-1" />
                                    <span>Hỗ trợ đào tạo miễn phí</span>
                                </li>
                            </ul>
                        </div>

                        <Link
                            href="/tutor/register"
                            className="w-full text-center font-landing-body font-semibold px-6 py-4 rounded-xl border-4 transition-all duration-200 hover:bg-white/50 inline-flex items-center justify-center cursor-pointer block"
                            style={{
                                color: "var(--color-clay-cta)",
                                borderColor: "var(--color-clay-cta)",
                            }}
                        >
                            Đăng ký làm Gia sư
                        </Link>
                        <p className="text-center font-landing-body text-xs mt-2" style={{ color: "var(--color-clay-text-muted)" }}>
                            Miễn phí đăng ký
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function LandingHero() {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Copy + CTAs */}
                <div className="animate-fade-in">
                    <h1
                        className="font-landing-heading text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                        style={{ color: "var(--color-clay-text)" }}
                    >
                        Con học vui,{" "}
                        <span style={{ color: "var(--color-clay-primary)" }}>
                            Bố mẹ yên tâm
                        </span>
                    </h1>

                    <p
                        className="font-landing-body text-xl md:text-2xl mb-8 leading-relaxed"
                        style={{ color: "var(--color-clay-text-muted)" }}
                    >
                        AI 24/7 + Gia sư chuyên môn = Học tập không kẽ hở cho trẻ tiểu học từ 6-11 tuổi
                    </p>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center gap-6 mb-10 font-landing-body text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <span className="font-semibold" style={{ color: "var(--color-clay-text)" }}>
                                4.8 đánh giá
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">👨‍👩‍👧‍👦</span>
                            <span className="font-semibold" style={{ color: "var(--color-clay-text)" }}>
                                3,000+ học sinh
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">👨‍🏫</span>
                            <span className="font-semibold" style={{ color: "var(--color-clay-text)" }}>
                                500+ gia sư
                            </span>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/register"
                            className="clay-button font-landing-body text-lg group inline-flex items-center justify-center gap-2"
                        >
                            Dùng thử miễn phí 7 ngày
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>

                        <Link
                            href="/tutor/register"
                            className="font-landing-body text-lg font-semibold px-6 py-3 rounded-xl border-4 transition-all duration-200 hover:bg-white/50 inline-flex items-center justify-center cursor-pointer"
                            style={{
                                color: "var(--color-clay-primary)",
                                borderColor: "var(--color-clay-primary)",
                            }}
                        >
                            Đăng ký làm Gia sư
                        </Link>
                    </div>

                    <p className="font-landing-body text-sm mt-4" style={{ color: "var(--color-clay-text-muted)" }}>
                        ✨ Không cần thẻ tín dụng • Hủy bất cứ lúc nào
                    </p>
                </div>

                {/* Right: Mascot Image */}
                <div className="relative animate-scale-in delay-200">
                    <div className="relative w-full aspect-square max-w-lg mx-auto">
                        <Image
                            src="/images/landing/mascot-hero.png"
                            alt="Linh vật Funny Learn đang vẫy tay chào"
                            fill
                            priority
                            className={`object-contain transition-opacity duration-500 ${imageLoaded ? "animate-wave" : "opacity-0"
                                }`}
                            onLoad={() => setImageLoaded(true)}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Floating decorative elements */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#F97316]/20 rounded-full blur-2xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#4F46E5]/20 rounded-full blur-2xl animate-pulse delay-100" />
                </div>
            </div>
        </section>
    );
}

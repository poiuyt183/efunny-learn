"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function FinalCTA() {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="clay-card p-12 md:p-16 text-center relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-[#4F46E5]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#F97316]/10 rounded-full blur-3xl" />

                <div className="relative max-w-3xl mx-auto">
                    {/* Mascot */}
                    <div className="relative w-32 h-32 mx-auto mb-8">
                        <Image
                            src="/images/landing/mascot-hero.png"
                            alt="Linh vật Funny Learn"
                            fill
                            className={`object-contain transition-opacity duration-500 ${imageLoaded ? "animate-wave-infinite" : "opacity-0"
                                }`}
                            onLoad={() => setImageLoaded(true)}
                            sizes="128px"
                        />
                    </div>

                    <h2
                        className="font-landing-heading text-4xl md:text-5xl font-bold mb-6"
                        style={{ color: "var(--color-clay-text)" }}
                    >
                        Bắt đầu hành trình học tập ngay hôm nay
                    </h2>

                    <p
                        className="font-landing-body text-xl mb-10"
                        style={{ color: "var(--color-clay-text-muted)" }}
                    >
                        Tham gia cùng 3,000+ học sinh đang học tập vui vẻ và hiệu quả với Funny Learn
                    </p>

                    {/* Primary CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                        <Link
                            href="/register"
                            className="clay-button font-landing-body text-xl group inline-flex items-center gap-2 px-8 py-4"
                        >
                            Dùng thử miễn phí 7 ngày
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                    </div>

                    <p className="font-landing-body text-sm mb-8" style={{ color: "var(--color-clay-text-muted)" }}>
                        ✨ Không cần thẻ tín dụng • Hủy bất cứ lúc nào
                    </p>

                    {/* Secondary Tutor CTA */}
                    <div className="pt-8 border-t-2 border-gray-200">
                        <p className="font-landing-body text-lg mb-4" style={{ color: "var(--color-clay-text)" }}>
                            Bạn là gia sư?{" "}
                            <Link
                                href="/tutor/register"
                                className="font-bold underline hover:no-underline transition-all duration-200"
                                style={{ color: "var(--color-clay-cta)" }}
                            >
                                Đăng ký tại đây →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

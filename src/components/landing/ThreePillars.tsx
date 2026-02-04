import Image from "next/image";
import { Sparkles, MessageCircle, Users } from "lucide-react";

export function ThreePillars() {
    const pillars = [
        {
            icon: Sparkles,
            title: "Linh Thú đồng hành",
            subtitle: "AI Companion",
            description:
                "Mỗi trẻ có một linh vật riêng tiến hóa cùng nỗ lực học tập. Biến bài tập thành nhiệm vụ săn vàng đầy hấp dẫn.",
            image: "/images/landing/mascot-learning.png",
            imageAlt: "Linh vật học tập với sách vở",
            keyPoints: [
                "Gamification: Nhiệm vụ hàng ngày",
                "Tiến hóa cùng con",
                "Động lực học tập tự nhiên",
            ],
            color: "#F97316", // Orange
        },
        {
            icon: MessageCircle,
            title: "Dạy tư duy, không chỉ đáp án",
            subtitle: "Socratic AI Tutor",
            description:
                "AI đặt câu hỏi gợi mở thay vì đưa đáp án sẵn. Giúp trẻ tự suy nghĩ và hiểu bản chất vấn đề.",
            image: "/images/landing/ai-tutor.png",
            imageAlt: "AI dạy học theo phương pháp Socratic",
            keyPoints: [
                "Phương pháp Socratic",
                "Hỗ trợ hình ảnh + giọng nói",
                "An toàn tuyệt đối",
            ],
            color: "#4F46E5", // Primary purple
        },
        {
            icon: Users,
            title: "Gia sư đúng người, đúng thời điểm",
            subtitle: "Smart Brokerage",
            description:
                "AI phân tích điểm yếu và đề xuất gia sư phù hợp nhất. Tiết kiệm chi phí, tối ưu hiệu quả.",
            image: "/images/landing/tutor-connection.png",
            imageAlt: "Kết nối thông minh với gia sư",
            keyPoints: [
                "Matching dựa trên dữ liệu AI",
                "Chỉ thuê khi cần",
                "Báo cáo năng lực tức thì",
            ],
            color: "#818CF8", // Secondary indigo
        },
    ];

    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h2
                    className="font-landing-heading text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: "var(--color-clay-text)" }}
                >
                    Ba Trụ Cột Cốt Lõi
                </h2>
                <p
                    className="font-landing-body text-xl max-w-2xl mx-auto"
                    style={{ color: "var(--color-clay-text-muted)" }}
                >
                    Hệ sinh thái học tập toàn diện kết hợp AI và con người
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pillars.map((pillar, index) => {
                    const IconComponent = pillar.icon;
                    return (
                        <div
                            key={index}
                            className="clay-card group p-8 animate-scale-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon */}
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110"
                                style={{
                                    backgroundColor: `${pillar.color}20`,
                                    border: `3px solid ${pillar.color}40`,
                                }}
                            >
                                <IconComponent
                                    className="w-8 h-8"
                                    style={{ color: pillar.color }}
                                />
                            </div>

                            {/* Title */}
                            <h3
                                className="font-landing-heading text-2xl font-bold mb-2"
                                style={{ color: "var(--color-clay-text)" }}
                            >
                                {pillar.title}
                            </h3>
                            <p
                                className="font-landing-body text-sm font-semibold mb-4"
                                style={{ color: pillar.color }}
                            >
                                {pillar.subtitle}
                            </p>

                            {/* Description */}
                            <p
                                className="font-landing-body mb-6 leading-relaxed"
                                style={{ color: "var(--color-clay-text-muted)" }}
                            >
                                {pillar.description}
                            </p>

                            {/* Image */}
                            <div className="relative w-full aspect-square mb-6 rounded-xl overflow-hidden">
                                <Image
                                    src={pillar.image}
                                    alt={pillar.imageAlt}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>

                            {/* Key Points */}
                            <ul className="space-y-2 font-landing-body text-sm">
                                {pillar.keyPoints.map((point, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2"
                                        style={{ color: "var(--color-clay-text)" }}
                                    >
                                        <span
                                            className="text-lg flex-shrink-0"
                                            style={{ color: pillar.color }}
                                        >
                                            ✓
                                        </span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

import Link from "next/link";

export function MarketingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t-4 border-[#4F46E5]/10 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 font-landing-heading font-bold text-2xl mb-4">
                            <span className="text-3xl">🦊</span>
                            <span style={{ color: "var(--color-clay-primary)" }}>Funny Learn</span>
                        </div>
                        <p className="font-landing-body text-gray-600 mb-4 max-w-md">
                            Nền tảng học tập thích ứng và Kết nối gia sư thông minh dành cho học sinh tiểu học.
                            Kết hợp AI 24/7 với gia sư chuyên môn.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-landing-body">⭐ 4.8 đánh giá</span>
                            <span className="font-landing-body">👨‍👩‍👧‍👦 3,000+ học sinh</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-landing-heading font-semibold text-lg mb-4" style={{ color: "var(--color-clay-text)" }}>
                            Liên kết
                        </h3>
                        <ul className="space-y-2 font-landing-body">
                            <li>
                                <Link href="/#features" className="text-gray-600 hover:text-[#4F46E5] transition-colors duration-200">
                                    Tính năng
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pricing" className="text-gray-600 hover:text-[#4F46E5] transition-colors duration-200">
                                    Bảng giá
                                </Link>
                            </li>
                            <li>
                                <Link href="/tutor/register" className="text-gray-600 hover:text-[#4F46E5] transition-colors duration-200">
                                    Dành cho Gia sư
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-landing-heading font-semibold text-lg mb-4" style={{ color: "var(--color-clay-text)" }}>
                            Hỗ trợ
                        </h3>
                        <ul className="space-y-2 font-landing-body">
                            <li>
                                <a href="mailto:support@funnylearn.vn" className="text-gray-600 hover:text-[#4F46E5] transition-colors duration-200">
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-[#4F46E5] transition-colors duration-200">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-600 hover:text-[#4F46E5] transition-colors duration-200">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-landing-body text-gray-500 text-sm">
                        © {currentYear} Funny Learn. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="font-landing-body text-sm text-gray-500">🇻🇳 Made in Vietnam</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 floating-navbar bg-background/20 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-landing-heading font-bold text-2xl"
            style={{ color: "var(--color-clay-primary)" }}
          >
            <span className="text-3xl">🦊</span>
            <span>Funny Learn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Kid-friendly login button */}
            <Link
              href="/login"
              className="font-landing-body font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%)",
                color: "white",
              }}
            >
              Trò chuyện với linh thú ngay
            </Link>

            {/* Parent login */}
            <Link
              href="/login"
              className="font-landing-body font-medium transition-colors duration-200 hover:text-[#4F46E5]"
              style={{ color: "var(--color-clay-text)" }}
            >
              Đăng nhập
            </Link>

            <Link
              href="/register"
              className="clay-button font-landing-body"
            >
              Dùng thử miễn phí
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: "var(--color-clay-text)" }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: "var(--color-clay-text)" }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-slide-up">
            <div className="flex flex-col gap-4">
              {/* Kid-friendly login button */}
              <Link
                href="/login"
                className="font-landing-body font-semibold px-4 py-3 rounded-xl transition-all duration-300 text-center"
                style={{
                  background: "linear-gradient(135deg, #FF6B9D 0%, #FFA06B 100%)",
                  color: "white",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                🎮 Con vào học
              </Link>

              {/* Parent login */}
              <Link
                href="/login"
                className="font-landing-body font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                style={{ color: "var(--color-clay-text)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>

              <Link
                href="/register"
                className="clay-button font-landing-body text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dùng thử miễn phí
              </Link>
              <Link
                href="/tutor/register"
                className="font-landing-body font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-center"
                style={{ color: "var(--color-clay-primary)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng ký làm Gia sư
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

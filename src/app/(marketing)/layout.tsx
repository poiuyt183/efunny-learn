import type { ReactNode } from "react";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { MarketingFooter } from "@/components/landing/MarketingFooter";

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen gradient-purple-soft">
            <MarketingNav />
            <main className="pt-24">
                {children}
            </main>
            <MarketingFooter />
        </div>
    );
}

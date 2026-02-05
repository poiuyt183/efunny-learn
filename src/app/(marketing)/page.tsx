import { LandingHero } from "@/components/landing/LandingHero";
import { ThreePillars } from "@/components/landing/ThreePillars";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default async function LandingPage() {
    return (
        <>
            <LandingHero />
            <ThreePillars />
            <PricingSection />
            <FinalCTA />
        </>
    );
}

import { LandingHero } from "@/components/landing/LandingHero";
import { ThreePillars } from "@/components/landing/ThreePillars";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LandingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // If user is authenticated, redirect to appropriate dashboard
    if (session) {
        switch (session.user.role) {
            case "PARENT":
                redirect("/dashboard");
            case "CHILD":
                redirect("/learn");
            case "TUTOR":
                redirect("/tutor/dashboard");
            default:
                redirect("/dashboard");
        }
    }
    return (
        <>
            <LandingHero />
            <ThreePillars />
            <PricingSection />
            <FinalCTA />
        </>
    );
}

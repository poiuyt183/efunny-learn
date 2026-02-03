import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import {
    Users,
    CreditCard,
    GraduationCap,
    Calendar,
    Home,
    LogOut,
    Menu,
} from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Tổng quan" },
        { href: "/dashboard/children", icon: Users, label: "Quản lý con" },
        { href: "/dashboard/subscription", icon: CreditCard, label: "Gói đăng ký" },
        { href: "/dashboard/tutors", icon: GraduationCap, label: "Tìm gia sư" },
        { href: "/dashboard/bookings", icon: Calendar, label: "Lịch học" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold">FL</span>
                                </div>
                                <span className="font-bold text-xl hidden sm:inline">Funny Learn</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <item.icon className="h-4 w-4" />
                                        <span className="hidden lg:inline">{item.label}</span>
                                    </Button>
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block text-sm">
                                <p className="font-medium">{session.user.name}</p>
                                <p className="text-xs text-muted-foreground">{session.user.email}</p>
                            </div>
                            <form action="/api/auth/sign-out" method="POST">
                                <Button variant="ghost" size="sm">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto pb-2">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap">
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkIsTutor } from "@/features/tutor/actions/tutor-actions";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { SignoutButton } from "@/features/auth/components/signout-button";

export default async function TutorLayout({
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

    const { isTutor, hasProfile } = await checkIsTutor();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo & Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                                FL
                            </div>
                            <span className="font-bold text-xl hidden sm:inline-block">
                                Funny Learn
                            </span>
                        </Link>

                        {hasProfile && (
                            <nav className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/tutor/dashboard"
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/tutor/students"
                                    className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                                >
                                    Học sinh
                                </Link>
                                <Link
                                    href="/tutor/schedule"
                                    className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                                >
                                    Lịch dạy
                                </Link>
                                <Link
                                    href="/tutor/earnings"
                                    className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                                >
                                    Thu nhập
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={session.user.image || undefined}
                                        alt={session.user.name}
                                    />
                                    <AvatarFallback>
                                        {session.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {session.user.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {session.user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {hasProfile && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href="/tutor/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/tutor/dashboard?tab=profile">Hồ sơ</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">Chế độ Phụ huynh</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <SignoutButton title="Đăng xuất" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <Spinner className="h-8 w-8" />
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </main>

            {/* Footer */}
            <footer className="border-t py-8 mt-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                                    FL
                                </div>
                                <span className="font-bold text-lg">Funny Learn</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Nền tảng kết nối gia sư thông minh cho học sinh tiểu học
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Dành cho Gia sư</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/tutor/setup" className="hover:text-primary">
                                        Đăng ký làm gia sư
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tutor/dashboard" className="hover:text-primary">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Hướng dẫn sử dụng
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Hỗ trợ</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Trung tâm trợ giúp
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Liên hệ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Điều khoản dịch vụ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Kết nối</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Facebook
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Zalo
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary">
                                        Email
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                        <p>&copy; 2026 Funny Learn. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

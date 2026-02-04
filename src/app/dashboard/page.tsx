import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";
import {
  Users,
  CreditCard,
  GraduationCap,
  Calendar,
  TrendingUp,
} from "lucide-react";
import prisma from "@/lib/db";
import { SubscriptionStatusCard } from "@/features/subscription/components/SubscriptionStatusCard";
import type { SubscriptionTier } from "@/lib/vnpay/config";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on role
  if (session.user.role === "TUTOR") {
    redirect("/tutor/dashboard");
  }

  // Get user data with subscription and children
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      children: true,
    },
  });

  const tier = (userData?.subscription?.tier || "FREE") as SubscriptionTier;
  const childrenCount = userData?.children.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h1>
        <p className="text-muted-foreground">
          Quản lý con cái, đăng ký gia sư và theo dõi tiến độ học tập
        </p>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Status Card */}
        <div className="md:col-span-2 lg:col-span-1">
          <SubscriptionStatusCard tier={tier} currentChildren={childrenCount} />
        </div>

        {/* Children Management */}
        <Link href="/dashboard/children">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group h-full">
            <div className="flex items-start mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">Quản lý con</h3>
                <p className="text-sm text-muted-foreground">
                  Theo dõi tiến độ học tập của con bạn
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Xem chi tiết →
            </div>
          </Card>
        </Link>

        {/* Subscription */}
        <Link href="/dashboard/subscription">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">Gói đăng ký</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý gói subscription của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Xem chi tiết →
            </div>
          </Card>
        </Link>

        {/* Find Tutors */}
        <Link href="/dashboard/tutors">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">Tìm gia sư</h3>
                <p className="text-sm text-muted-foreground">
                  Kết nối với gia sư phù hợp
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Xem chi tiết →
            </div>
          </Card>
        </Link>

        {/* My Bookings */}
        <Link href="/dashboard/bookings">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">Lịch học</h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý các buổi học đã đặt
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              Xem chi tiết →
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Thống kê nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">{childrenCount}</div>
            <p className="text-sm text-muted-foreground">Profiles con</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">{tier}</div>
            <p className="text-sm text-muted-foreground">Gói hiện tại</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">0</div>
            <p className="text-sm text-muted-foreground">Buổi học</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
            <p className="text-sm text-muted-foreground">Câu hỏi AI</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

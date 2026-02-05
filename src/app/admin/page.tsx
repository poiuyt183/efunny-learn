import {
    getDashboardStats,
    getRecentActivity,
    getUserGrowthData,
    getRevenueTrendData,
    getSubscriptionDistribution,
    getUserRoleDistribution,
} from "@/features/admin/actions";
import { StatsCard } from "./components/stats-card";
import { PageHeader } from "./components/page-header";
import {
    UserGrowthChart,
    RevenueTrendChart,
    SubscriptionChart,
    UserRoleChart,
} from "./components/charts";
import {
    UsersIcon,
    UserPlusIcon,
    CreditCardIcon,
    DollarSignIcon,
    AlertCircleIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboard() {
    const [stats, activity, userGrowth, revenueTrend, subscriptions, userRoles] =
        await Promise.all([
            getDashboardStats(),
            getRecentActivity(),
            getUserGrowthData(),
            getRevenueTrendData(),
            getSubscriptionDistribution(),
            getUserRoleDistribution(),
        ]);

    // Format revenue to VND
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "PARENT":
                return "default";
            case "CHILD":
                return "secondary";
            case "TUTOR":
                return "outline";
            case "ADMIN":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Admin Dashboard"
                description="Overview of Funny Learn platform metrics"
                breadcrumbs={[{ label: "Dashboard" }]}
            />

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={UsersIcon}
                    description={`Parents: ${stats.usersByRole.PARENT || 0} | Tutors: ${stats.usersByRole.TUTOR || 0} | Children: ${stats.usersByRole.CHILD || 0}`}
                />
                <StatsCard
                    title="New Users This Week"
                    value={stats.newUsersThisWeek}
                    icon={UserPlusIcon}
                    description="Last 7 days"
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    icon={CreditCardIcon}
                    description="BASIC + PREMIUM tiers"
                />
                <StatsCard
                    title="Revenue This Month"
                    value={formatVND(stats.monthlyRevenue)}
                    icon={DollarSignIcon}
                    description="Total successful payments"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <UserGrowthChart data={userGrowth} />
                <RevenueTrendChart data={revenueTrend} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <SubscriptionChart data={subscriptions} />
                <UserRoleChart data={userRoles} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activity.recentUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(user.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {activity.pendingTutors > 0 && (
                            <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                                <div className="flex items-center gap-3">
                                    <AlertCircleIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Pending Tutor Verifications
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {activity.pendingTutors} tutor
                                            {activity.pendingTutors > 1 ? "s" : ""} waiting for
                                            approval
                                        </p>
                                    </div>
                                </div>
                                <Button asChild size="sm">
                                    <Link href="/admin/users/tutors?filter=pending">Review</Link>
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" asChild className="h-auto flex-col gap-1 p-4">
                                <Link href="/admin/users/children">
                                    <UsersIcon className="size-5" />
                                    <span className="text-sm">View Children</span>
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="h-auto flex-col gap-1 p-4">
                                <Link href="/admin/users/parents">
                                    <UsersIcon className="size-5" />
                                    <span className="text-sm">View Parents</span>
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="h-auto flex-col gap-1 p-4">
                                <Link href="/admin/users/tutors">
                                    <UsersIcon className="size-5" />
                                    <span className="text-sm">View Tutors</span>
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                disabled
                                className="h-auto flex-col gap-1 p-4"
                            >
                                <DollarSignIcon className="size-5" />
                                <span className="text-sm">Revenue Reports</span>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                    Soon
                                </Badge>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

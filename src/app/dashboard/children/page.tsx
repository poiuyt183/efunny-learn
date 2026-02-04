import { getChildren, getSpiritAnimals } from "@/features/children/actions/child-actions";
import { ChildCard } from "@/features/children/components/ChildCard";
import { Button } from "@/components/ui/button";
import { Plus, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkChildProfileLimit } from "@/lib/rate-limit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getTierDisplayName } from "@/lib/vnpay/config";

export default async function ChildrenPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const [childrenResult, spiritAnimalsResult, limitCheck] = await Promise.all([
        getChildren(),
        getSpiritAnimals(),
        checkChildProfileLimit(session.user.id),
    ]);

    // Check authentication first
    if (!childrenResult.success) {
        console.error("❌ Cannot access children page:", childrenResult.error);
        // User is not authenticated, redirect to login
        redirect("/login");
    }

    const children = childrenResult.data || [];
    const spiritAnimals = spiritAnimalsResult.data || [];
    const canAddMore = limitCheck.allowed;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý con</h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi tiến độ học tập của con bạn
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                            {limitCheck.current}/{limitCheck.limit} profiles
                        </Badge>
                        <Badge variant="secondary">
                            Gói {getTierDisplayName(limitCheck.tier)}
                        </Badge>
                    </div>
                </div>
                {canAddMore ? (
                    <Link href="/dashboard/children/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm con
                        </Button>
                    </Link>
                ) : (
                    <Button disabled title="Đã đạt giới hạn profile">
                        <Lock className="h-4 w-4 mr-2" />
                        Thêm con
                    </Button>
                )}
            </div>

            {/* Limit Warning */}
            {!canAddMore && (
                <Alert className="mb-6">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Đã đạt giới hạn profile</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            Bạn đã sử dụng {limitCheck.current}/{limitCheck.limit} profiles với gói {getTierDisplayName(limitCheck.tier)}.
                            Nâng cấp gói để thêm nhiều profile hơn.
                        </span>
                        <Link href="/dashboard/subscription">
                            <Button variant="outline" size="sm" className="ml-4">
                                Nâng cấp
                            </Button>
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* Children List */}
            {children.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Chưa có hồ sơ con</h3>
                        <p className="text-muted-foreground mb-6">
                            Thêm hồ sơ con để bắt đầu theo dõi tiến độ học tập
                        </p>
                    </div>
                    <Link href="/dashboard/children/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm hồ sơ con đầu tiên
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children.map((child) => (
                        <ChildCard
                            key={child.id}
                            child={child}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

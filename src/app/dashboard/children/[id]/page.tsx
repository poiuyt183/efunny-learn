import { getChildById } from "@/features/children/actions/child-actions";
import { checkChildHasAccount } from "@/features/children/actions/child-account-actions";
import { CreateChildAccountDialog } from "@/features/children/components/CreateChildAccountDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Calendar, BookOpen, Star, UserCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ChildDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ChildDetailPage({ params }: ChildDetailPageProps) {
    const { id } = await params;
    const result = await getChildById(id);

    if (!result.success || !result.data) {
        redirect("/dashboard/children");
    }

    const child = result.data;

    // Check if child has account
    const accountResult = await checkChildHasAccount(id);
    const hasAccount = accountResult.success && accountResult.data?.hasAccount;
    const childEmail = accountResult.data?.email;

    const currentYear = new Date().getFullYear();
    const age = currentYear - child.birthYear;

    // Calculate XP progress to next level
    const xpForNextLevel = child.level * 100;
    const xpProgress = (child.xp % 100) / xpForNextLevel * 100;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Back Button */}
            <Link href="/dashboard/children">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
            </Link>

            {/* Child Header */}
            <Card className="p-6 mb-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold flex-shrink-0"
                        style={{
                            backgroundColor: `${child.spiritAnimal.color}20`,
                            color: child.spiritAnimal.color,
                        }}
                    >
                        {child.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{child.name}</h1>
                                <p className="text-muted-foreground">
                                    {age} tuổi • Lớp {child.grade} • Sinh năm {child.birthYear}
                                </p>
                            </div>
                            <Link href={`/dashboard/children/${child.id}/edit`}>
                                <Button variant="outline">Chỉnh sửa</Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">
                                {child.spiritAnimal.name}
                            </Badge>
                            <Badge variant="outline">
                                Level {child.level}
                            </Badge>
                            {hasAccount && (
                                <Badge className="bg-green-600">
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    Có tài khoản
                                </Badge>
                            )}
                        </div>

                        {/* Account Info */}
                        {hasAccount && childEmail ? (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-900 dark:text-green-100">
                                    📧 Tài khoản: <span className="font-mono font-semibold">{childEmail}</span>
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    Con bạn có thể đăng nhập tại <span className="font-semibold">/learn/login</span>
                                </p>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <CreateChildAccountDialog childId={child.id} childName={child.name} />
                            </div>
                        )}

                        {/* XP Progress */}
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Kinh nghiệm</span>
                                <span className="font-medium">{child.xp} XP</span>
                            </div>
                            <Progress value={xpProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {100 - (child.xp % 100)} XP nữa để lên Level {child.level + 1}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Spirit Animal */}
                    <Card className="p-5">
                        <h3 className="font-semibold mb-3">Spirit Animal</h3>
                        <div
                            className="p-4 rounded-lg mb-3"
                            style={{ backgroundColor: `${child.spiritAnimal.color}15` }}
                        >
                            <div
                                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-semibold"
                                style={{
                                    backgroundColor: `${child.spiritAnimal.color}30`,
                                    color: child.spiritAnimal.color,
                                }}
                            >
                                {child.spiritAnimal.name.charAt(0)}
                            </div>
                            <h4 className="font-semibold text-center mb-1">
                                {child.spiritAnimal.name}
                            </h4>
                            <p className="text-xs text-center text-muted-foreground">
                                {child.spiritAnimal.description}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {child.spiritAnimal.personality.map((trait) => (
                                <span
                                    key={trait}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                        backgroundColor: `${child.spiritAnimal.color}15`,
                                        color: child.spiritAnimal.color,
                                    }}
                                >
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Learning Analysis */}
                    {child.analysis && (
                        <Card className="p-5">
                            <h3 className="font-semibold mb-3">Phân tích học tập</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Tính cách:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {child.analysis.traits.map((trait) => (
                                            <Badge key={trait} variant="outline" className="text-xs">
                                                {trait}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {child.analysis.favoriteSubjects.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Môn yêu thích:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {child.analysis.favoriteSubjects.map((subject) => (
                                                <Badge key={subject} className="text-xs">
                                                    {subject}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {child.analysis.learningStyle && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Phong cách học:</p>
                                        <Badge variant="secondary">{child.analysis.learningStyle}</Badge>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column - Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Chat Sessions */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Phiên học gần đây
                            </h3>
                            <Badge variant="outline">
                                {child.chatSessions.length} phiên
                            </Badge>
                        </div>
                        {child.chatSessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Chưa có phiên học nào
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {child.chatSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">
                                                {session.title || "Phiên học"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(session.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            Xem
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Recent Bookings */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Lịch học gia sư
                            </h3>
                            <Badge variant="outline">
                                {child.bookings.length} buổi
                            </Badge>
                        </div>
                        {child.bookings.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Chưa có buổi học nào
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {child.bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                {booking.tutor.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {booking.tutor.user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(booking.scheduledAt).toLocaleDateString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                booking.status === "COMPLETED"
                                                    ? "default"
                                                    : booking.status === "CONFIRMED"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                        >
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Daily Usage Chart */}
                    {child.dailyUsage.length > 0 && (
                        <Card className="p-5">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Hoạt động 30 ngày qua
                            </h3>
                            <div className="space-y-2">
                                {child.dailyUsage.slice(0, 7).map((usage) => (
                                    <div key={usage.id} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-20">
                                            {usage.date}
                                        </span>
                                        <Progress
                                            value={(usage.questionsAsked / 50) * 100}
                                            className="flex-1"
                                        />
                                        <span className="text-sm font-medium w-12 text-right">
                                            {usage.questionsAsked}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

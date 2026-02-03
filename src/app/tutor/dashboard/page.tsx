import { redirect } from "next/navigation";
import { checkIsTutor, getTutorProfile, getTutorStats } from "@/features/tutor/actions/tutor-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorProfileForm } from "@/features/tutor/components/TutorProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function TutorDashboardPage() {
    // Check if user is tutor
    const { hasProfile } = await checkIsTutor();

    if (!hasProfile) {
        redirect("/tutor/setup");
    }

    // Get tutor profile and stats
    const profileResult = await getTutorProfile();
    const statsResult = await getTutorStats();

    if (!profileResult.success || !profileResult.data) {
        redirect("/tutor/setup");
    }

    const tutor = profileResult.data;
    const stats = statsResult.success ? statsResult.data : null;

    return (
        <div className="container mx-auto max-w-7xl py-10 px-4">
            {/* Welcome Banner */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg border">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                        <AvatarImage src={tutor.user.image || undefined} alt={tutor.user.name} />
                        <AvatarFallback className="text-lg font-semibold">{tutor.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight mb-1">
                            Xin chào, {tutor.user.name}! 👋
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {tutor.user.email}
                        </p>
                    </div>
                    <div>
                        {tutor.verified ? (
                            <Badge variant="default" className="bg-green-600">
                                ✓ Đã xác minh
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-amber-500 text-white">
                                ⏳ Chờ xác minh
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tổng buổi dạy
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSessions}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.thisMonthSessions} buổi trong tháng này
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tổng thu nhập
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(stats.totalEarnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tất cả các buổi học
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Thu nhập tháng này
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(stats.thisMonthEarnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Từ {stats.thisMonthSessions} buổi học
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Đánh giá
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.rating > 0 ? stats.rating.toFixed(1) : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.rating > 0 ? "Trung bình từ học sinh" : "Chưa có đánh giá"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                    <TabsTrigger value="schedule">Lịch dạy</TabsTrigger>
                    <TabsTrigger value="students">Học sinh</TabsTrigger>
                    <TabsTrigger value="earnings">Thu nhập</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin hồ sơ gia sư của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TutorProfileForm
                                initialData={{
                                    subjects: tutor.subjects,
                                    grades: tutor.grades,
                                    hourlyRate: tutor.hourlyRate,
                                    bio: tutor.bio,
                                    bankAccount: tutor.bankAccount || "",
                                    certificates: tutor.certificates || [],
                                }}
                                verified={tutor.verified}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch dạy</CardTitle>
                            <CardDescription>
                                Quản lý lịch giảng dạy của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Chức năng đang được phát triển...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Học sinh của tôi</CardTitle>
                            <CardDescription>
                                Xem danh sách học sinh và báo cáo AI
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Chức năng đang được phát triển...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="earnings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thu nhập & Rút tiền</CardTitle>
                            <CardDescription>
                                Theo dõi thu nhập và yêu cầu thanh toán
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Chức năng đang được phát triển...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTutorById } from "@/features/tutor/actions/tutor-actions";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import { MultiDateBookingForm } from "@/features/bookings/components/MultiDateBookingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    GraduationCap,
    Star,
    BookOpen,
    Award,
    CheckCircle,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TutorDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const result = await getTutorById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const tutor = result.data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-6">
                <Link href="/dashboard/tutors">← Quay lại danh sách</Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Tutor Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold">
                                        {session.user.name.charAt(0)}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                                {session.user.name}
                                                {tutor.verified && (
                                                    <Badge className="bg-green-600">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Đã xác minh
                                                    </Badge>
                                                )}
                                            </h1>
                                            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                                {tutor.rating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-semibold">
                                                            {tutor.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>{tutor.totalSessions} buổi học</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-primary">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(tutor.hourlyRate)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">/giờ</div>
                                        </div>
                                    </div>

                                    {/* Subjects */}
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            Môn học
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.subjects.map((subject) => (
                                                <Badge key={subject} variant="secondary">
                                                    {subject}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Grades */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2">Khối lớp</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tutor.grades.sort((a, b) => a - b).map((grade) => (
                                                <Badge key={grade} variant="outline">
                                                    Lớp {grade}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Giới thiệu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {tutor.bio}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Certificates */}
                    {tutor.certificates && tutor.certificates.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Chứng chỉ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {tutor.certificates.map((cert, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                        >
                                            <Award className="w-4 h-4 text-primary" />
                                            <a
                                                href={cert}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                Chứng chỉ {index + 1}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Booking Form */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4">
                        <Tabs defaultValue="single" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="single">Đặt 1 ngày</TabsTrigger>
                                <TabsTrigger value="multiple">Đặt nhiều ngày</TabsTrigger>
                            </TabsList>
                            <TabsContent value="single" className="mt-4">
                                <BookingForm tutorId={tutor.id} hourlyRate={tutor.hourlyRate} />
                            </TabsContent>
                            <TabsContent value="multiple" className="mt-4">
                                <MultiDateBookingForm tutorId={tutor.id} hourlyRate={tutor.hourlyRate} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

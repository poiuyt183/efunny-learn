"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TutorCardProps {
    tutor: {
        id: string;
        subjects: string[];
        grades: number[];
        hourlyRate: number;
        bio: string;
        rating: number;
        totalSessions: number;
        verified: boolean;
        user: {
            name: string;
            image: string | null;
        };
    };
}

export function TutorCard({ tutor }: TutorCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xl font-bold">
                            {tutor.user.name.charAt(0)}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {tutor.user.name}
                                    {tutor.verified && (
                                        <Badge variant="default" className="bg-green-600 text-xs">
                                            Đã xác minh
                                        </Badge>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    {tutor.rating > 0 && (
                                        <span className="flex items-center gap-1">
                                            ⭐ {tutor.rating.toFixed(1)}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{tutor.totalSessions} buổi học</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(tutor.hourlyRate)}
                                </p>
                                <p className="text-xs text-muted-foreground">/giờ</p>
                            </div>
                        </div>

                        {/* Subjects */}
                        <div className="flex flex-wrap gap-1 mb-3">
                            {tutor.subjects.slice(0, 4).map((subject) => (
                                <Badge key={subject} variant="secondary" className="text-xs">
                                    {subject}
                                </Badge>
                            ))}
                            {tutor.subjects.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{tutor.subjects.length - 4}
                                </Badge>
                            )}
                        </div>

                        {/* Grades */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                            <span>Lớp:</span>
                            <span>
                                {tutor.grades.sort((a, b) => a - b).join(", ")}
                            </span>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {tutor.bio}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button asChild className="flex-1">
                                <Link href={`/dashboard/tutors/${tutor.id}`}>Xem chi tiết</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

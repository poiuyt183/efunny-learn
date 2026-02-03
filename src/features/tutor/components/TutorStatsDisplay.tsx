"use client";

import { Badge } from "@/components/ui/badge";

interface TutorStatsDisplayProps {
    stats: {
        totalSessions: number;
        totalEarnings: number;
        thisMonthEarnings: number;
        thisMonthSessions: number;
        rating: number;
    };
}

export function TutorStatsDisplay({ stats }: TutorStatsDisplayProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tổng buổi dạy</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">
                    {stats.thisMonthSessions} buổi tháng này
                </p>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tổng thu nhập</p>
                <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                        compactDisplay: "short",
                    }).format(stats.totalEarnings)}
                </p>
                <p className="text-xs text-muted-foreground">VND</p>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Thu nhập tháng này</p>
                <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                        compactDisplay: "short",
                    }).format(stats.thisMonthEarnings)}
                </p>
                <p className="text-xs text-muted-foreground">VND</p>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Đánh giá</p>
                <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                        {stats.rating > 0 ? stats.rating.toFixed(1) : "N/A"}
                    </p>
                    {stats.rating > 0 && <span className="text-yellow-500">⭐</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                    {stats.rating > 0 ? "Từ học sinh" : "Chưa có đánh giá"}
                </p>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

const SUBJECTS = [
    "Toán",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Văn",
    "Tiếng Anh",
    "Lịch sử",
    "Địa lý",
];

const GRADES = [6, 7, 8, 9, 10, 11, 12];

interface TutorFiltersProps {
    onFilterChange: (filters: {
        subject?: string;
        grade?: number;
        minRate?: number;
        maxRate?: number;
        verifiedOnly?: boolean;
    }) => void;
}

export function TutorFilters({ onFilterChange }: TutorFiltersProps) {
    const [subject, setSubject] = useState<string>();
    const [grade, setGrade] = useState<number>();
    const [minRate, setMinRate] = useState<number>();
    const [maxRate, setMaxRate] = useState<number>();
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const handleApplyFilters = () => {
        onFilterChange({
            subject,
            grade,
            minRate,
            maxRate,
            verifiedOnly,
        });
    };

    const handleResetFilters = () => {
        setSubject(undefined);
        setGrade(undefined);
        setMinRate(undefined);
        setMaxRate(undefined);
        setVerifiedOnly(false);
        onFilterChange({});
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-4">Bộ lọc tìm kiếm</h3>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label>Môn học</Label>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn môn học" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUBJECTS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Grade */}
                    <div className="space-y-2">
                        <Label>Khối lớp</Label>
                        <Select
                            value={grade?.toString()}
                            onValueChange={(v) => setGrade(Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn khối lớp" />
                            </SelectTrigger>
                            <SelectContent>
                                {GRADES.map((g) => (
                                    <SelectItem key={g} value={g.toString()}>
                                        Lớp {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <Label>Giá giờ (VNĐ)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="number"
                                placeholder="Tối thiểu"
                                value={minRate || ""}
                                onChange={(e) =>
                                    setMinRate(e.target.value ? Number(e.target.value) : undefined)
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Tối đa"
                                value={maxRate || ""}
                                onChange={(e) =>
                                    setMaxRate(e.target.value ? Number(e.target.value) : undefined)
                                }
                            />
                        </div>
                    </div>

                    {/* Verified Only */}
                    <div className="flex items-center justify-between">
                        <Label>Chỉ hiển thị đã xác minh</Label>
                        <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleApplyFilters} className="flex-1">
                            Áp dụng
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="flex-1"
                        >
                            <FilterX className="w-4 h-4 mr-2" />
                            Đặt lại
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

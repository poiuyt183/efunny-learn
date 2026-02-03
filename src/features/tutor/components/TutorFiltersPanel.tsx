"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
    "Toán",
    "Tiếng Việt",
    "Tiếng Anh",
    "Khoa học",
    "Lịch sử",
    "Địa lý",
    "Vật lý",
    "Hóa học",
    "Sinh học",
];

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export interface TutorFilters {
    subject?: string;
    grade?: number;
    minRate?: number;
    maxRate?: number;
    verifiedOnly?: boolean;
}

interface TutorFiltersPanelProps {
    onFiltersChange: (filters: TutorFilters) => void;
}

export function TutorFiltersPanel({ onFiltersChange }: TutorFiltersPanelProps) {
    const [filters, setFilters] = useState<TutorFilters>({});

    const updateFilters = (newFilters: Partial<TutorFilters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFiltersChange(updated);
    };

    const clearFilters = () => {
        setFilters({});
        onFiltersChange({});
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Bộ lọc</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Xóa tất cả
                </Button>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <Label>Môn học</Label>
                <Select
                    value={filters.subject}
                    onValueChange={(value) =>
                        updateFilters({ subject: value === "all" ? undefined : value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tất cả môn học" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả môn học</SelectItem>
                        {SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                                {subject}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Grade */}
            <div className="space-y-2">
                <Label>Khối lớp</Label>
                <Select
                    value={filters.grade?.toString()}
                    onValueChange={(value) =>
                        updateFilters({
                            grade: value === "all" ? undefined : parseInt(value),
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tất cả khối lớp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả khối lớp</SelectItem>
                        {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade.toString()}>
                                Lớp {grade}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Rate Range */}
            <div className="space-y-2">
                <Label>Mức giá (VND/giờ)</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Từ"
                        value={filters.minRate || ""}
                        onChange={(e) =>
                            updateFilters({
                                minRate: e.target.value ? parseInt(e.target.value) : undefined,
                            })
                        }
                    />
                    <Input
                        type="number"
                        placeholder="Đến"
                        value={filters.maxRate || ""}
                        onChange={(e) =>
                            updateFilters({
                                maxRate: e.target.value ? parseInt(e.target.value) : undefined,
                            })
                        }
                    />
                </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="verified"
                    checked={filters.verifiedOnly || false}
                    onChange={(e) => updateFilters({ verifiedOnly: e.target.checked })}
                    className="h-4 w-4"
                />
                <Label htmlFor="verified" className="cursor-pointer">
                    Chỉ gia sư đã xác minh
                </Label>
            </div>

            {/* Active Filters */}
            {Object.keys(filters).length > 0 && (
                <div className="pt-4 border-t space-y-2">
                    <Label className="text-xs text-muted-foreground">Đang lọc:</Label>
                    <div className="flex flex-wrap gap-2">
                        {filters.subject && (
                            <Badge variant="secondary">Môn: {filters.subject}</Badge>
                        )}
                        {filters.grade && (
                            <Badge variant="secondary">Lớp {filters.grade}</Badge>
                        )}
                        {(filters.minRate || filters.maxRate) && (
                            <Badge variant="secondary">
                                {filters.minRate && `${filters.minRate.toLocaleString()}đ`}
                                {filters.minRate && filters.maxRate && " - "}
                                {filters.maxRate && `${filters.maxRate.toLocaleString()}đ`}
                            </Badge>
                        )}
                        {filters.verifiedOnly && (
                            <Badge variant="secondary">Đã xác minh</Badge>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

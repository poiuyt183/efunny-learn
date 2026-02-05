"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon } from "lucide-react";
import { useState } from "react";

type Tutor = {
    id: string;
    subjects: string[];
    grades: number[];
    hourlyRate: number;
    rating: number;
    totalSessions: number;
    verified: boolean;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
    };
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type Props = {
    data: Tutor[];
    pagination: Pagination;
};

export function TutorsTable({ data, pagination }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        params.delete("page");
        params.delete("filter"); // Clear filter shortcut
        router.push(`?${params.toString()}`);
    };

    const handleVerifiedFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set("verified", value);
        } else {
            params.delete("verified");
        }
        params.delete("page");
        params.delete("filter");
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const currentFilter = searchParams.get("filter") === "pending"
        ? "false"
        : searchParams.get("verified") || "all";

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tutors ({pagination.total})</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="w-[300px] pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch(search);
                                    }
                                }}
                            />
                        </div>
                        <Select
                            value={currentFilter}
                            onValueChange={handleVerifiedFilter}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="true">Verified</SelectItem>
                                <SelectItem value="false">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Grades</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Sessions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No tutors found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((tutor) => (
                                    <TableRow key={tutor.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{tutor.user.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {tutor.user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {tutor.subjects.slice(0, 2).map((subject) => (
                                                    <Badge key={subject} variant="secondary" className="text-xs">
                                                        {subject}
                                                    </Badge>
                                                ))}
                                                {tutor.subjects.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{tutor.subjects.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {tutor.grades.join(", ")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatVND(tutor.hourlyRate)}/h
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">
                                                    {tutor.rating.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">★</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{tutor.totalSessions}</TableCell>
                                        <TableCell>
                                            {tutor.verified ? (
                                                <Badge variant="default">Verified</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                                    <AlertCircleIcon className="mr-1 size-3" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/users/tutors/${tutor.id}`}>
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                            {pagination.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeftIcon className="size-4" />
                                Previous
                            </Button>
                            <div className="text-sm">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Next
                                <ChevronRightIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

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
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

type Child = {
    id: string;
    name: string;
    username: string | null;
    grade: number;
    level: number;
    xp: number;
    createdAt: Date;
    user: {
        email: string;
        name: string;
    };
    spiritAnimal: {
        name: string;
        slug: string;
        color: string;
    };
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type Props = {
    data: Child[];
    pagination: Pagination;
};

export function ChildrenTable({ data, pagination }: Props) {
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
        params.delete("page"); // Reset to page 1
        router.push(`?${params.toString()}`);
    };

    const handleGradeFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set("grade", value);
        } else {
            params.delete("grade");
        }
        params.delete("page");
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Children ({pagination.total})</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or parent email..."
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
                            value={searchParams.get("grade") || "all"}
                            onValueChange={handleGradeFilter}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grades</SelectItem>
                                {[1, 2, 3, 4, 5, 6].map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()}>
                                        Grade {grade}
                                    </SelectItem>
                                ))}
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
                                <TableHead>Parent</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>XP</TableHead>
                                <TableHead>Spirit Animal</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No children found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((child) => (
                                    <TableRow key={child.id}>
                                        <TableCell className="font-medium">{child.name}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm">{child.user.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {child.user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{child.grade}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{child.level}</Badge>
                                        </TableCell>
                                        <TableCell>{child.xp.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: child.spiritAnimal.color }}
                                                />
                                                <span className="text-sm">
                                                    {child.spiritAnimal.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(child.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/users/children/${child.id}`}>
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

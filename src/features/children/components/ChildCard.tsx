"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, TrendingUp, BookOpen, Calendar } from "lucide-react";
import type { Child, SpiritAnimal, ChildAnalysis } from "@/generated/prisma/client";
import { useState, useTransition } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteChild } from "../actions/child-actions";
import { toast } from "sonner";
import Link from "next/link";

interface ChildCardProps {
    child: Child & {
        spiritAnimal: SpiritAnimal;
        analysis?: ChildAnalysis | null;
        _count?: {
            chatSessions: number;
            bookings: number;
        };
    };
}

export function ChildCard({ child }: ChildCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteChild(child.id);

            if (result.success) {
                toast.success("Đã xóa hồ sơ con");
            } else {
                toast.error(result.error || "Có lỗi xảy ra");
            }

            setShowDeleteDialog(false);
        });
    };

    const currentYear = new Date().getFullYear();
    const age = currentYear - child.birthYear;

    return (
        <>
            <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        {/* Spirit Animal Avatar */}
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0"
                            style={{
                                backgroundColor: `${child.spiritAnimal.color}20`,
                                color: child.spiritAnimal.color,
                            }}
                        >
                            {child.name.charAt(0)}
                        </div>

                        {/* Child Info */}
                        <div>
                            <h3 className="font-semibold text-lg">{child.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {age} tuổi • Lớp {child.grade}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                    {child.spiritAnimal.name}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    Level {child.level}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link href={`/dashboard/children/${child.id}/edit`}>
                            <Button
                                variant="ghost"
                                size="icon"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="h-3 w-3" />
                            XP
                        </div>
                        <div className="font-semibold">{child.xp.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                            <BookOpen className="h-3 w-3" />
                            Học tập
                        </div>
                        <div className="font-semibold">{child._count?.chatSessions || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                            <Calendar className="h-3 w-3" />
                            Gia sư
                        </div>
                        <div className="font-semibold">{child._count?.bookings || 0}</div>
                    </div>
                </div>

                {/* Learning Style */}
                {child.analysis && (
                    <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Phong cách học:</p>
                        <div className="flex flex-wrap gap-1">
                            {child.analysis.traits.slice(0, 3).map((trait) => (
                                <span
                                    key={trait}
                                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                                >
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Details */}
                <Link href={`/dashboard/children/${child.id}`}>
                    <Button variant="outline" className="w-full">
                        Xem chi tiết
                    </Button>
                </Link>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa hồ sơ của <strong>{child.name}</strong>?
                            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

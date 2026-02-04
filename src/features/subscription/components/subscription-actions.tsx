"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelSubscription, downgradeSubscription } from "../actions/subscription-actions";

interface SubscriptionActionsProps {
    tier: "FREE" | "BASIC" | "PREMIUM";
    isCurrentTier: boolean;
    canUpgrade: boolean;
    canDowngrade: boolean;
    currentTier?: "FREE" | "BASIC" | "PREMIUM";
}

export function SubscriptionActions({
    tier,
    isCurrentTier,
    canUpgrade,
    canDowngrade,
    currentTier,
}: SubscriptionActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/subscription/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            toast.error("Không thể tạo thanh toán. Vui lòng thử lại sau.");
            console.error(error);
            setLoading(false);
        }
    };

    const handleDowngrade = async () => {
        try {
            setLoading(true);
            const result = await downgradeSubscription(tier);

            if (!result.success) {
                toast.error(result.error || "Có lỗi xảy ra");
                return;
            }

            toast.success(result.message || "Đã hạ cấp gói thành công");
            router.refresh();
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setLoading(true);
            const result = await cancelSubscription();

            if (!result.success) {
                toast.error(result.error || "Có lỗi xảy ra");
                return;
            }

            toast.success(result.message || "Đã hủy gói thành công");
            router.refresh();
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Current tier - show cancel button
    if (isCurrentTier && tier !== "FREE") {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={loading}>
                        Hủy gói
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy gói</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy gói {tier}? Bạn sẽ vẫn sử dụng được đến hết kỳ hiện tại,
                            sau đó tài khoản sẽ chuyển về gói FREE.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xác nhận hủy"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    // Can upgrade - show upgrade button
    if (canUpgrade) {
        return (
            <Button
                className="w-full"
                onClick={handleUpgrade}
                disabled={loading}
            >
                {loading ? "Đang xử lý..." : "Nâng cấp"}
            </Button>
        );
    }

    // Can downgrade - show downgrade button with confirmation
    if (canDowngrade) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={loading}>
                        Chuyển sang gói này
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hạ cấp</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn chuyển từ gói {currentTier} sang gói {tier}?
                            Một số tính năng sẽ bị giới hạn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDowngrade} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    // Current tier or can't change
    return (
        <Button className="w-full" variant="outline" disabled>
            {isCurrentTier ? "Gói hiện tại" : tier === "FREE" ? "Gói miễn phí" : "Không khả dụng"}
        </Button>
    );
}

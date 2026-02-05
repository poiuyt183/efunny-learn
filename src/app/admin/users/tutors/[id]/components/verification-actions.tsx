"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
import { CheckIcon, XIcon } from "lucide-react";
import { verifyTutor } from "@/features/admin/queries";
import { toast } from "sonner";

type Props = {
    tutorId: string;
};

export function VerificationActions({ tutorId }: Props) {
    const router = useRouter();
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await verifyTutor(tutorId, true);
            toast.success("Tutor verified successfully");
            router.refresh();
            setShowApproveDialog(false);
        } catch (error) {
            toast.error("Failed to verify tutor");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await verifyTutor(tutorId, false);
            toast.success("Tutor verification rejected");
            router.push("/admin/users/tutors");
        } catch (error) {
            toast.error("Failed to reject tutor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectDialog(true)}
                >
                    <XIcon className="mr-1 size-4" />
                    Reject
                </Button>
                <Button size="sm" onClick={() => setShowApproveDialog(true)}>
                    <CheckIcon className="mr-1 size-4" />
                    Approve
                </Button>
            </div>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Tutor Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to verify this tutor? They will be able to
                            accept bookings from students after approval.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} disabled={isLoading}>
                            {isLoading ? "Approving..." : "Approve"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Tutor Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject this tutor's verification? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? "Rejecting..." : "Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

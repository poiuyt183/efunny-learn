import { getSpiritAnimals } from "@/features/children/actions/child-actions";
import { ChildForm } from "@/features/children/components/ChildForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkChildProfileLimit } from "@/lib/rate-limit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getTierDisplayName } from "@/lib/vnpay/config";

export default async function NewChildPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const [result, limitCheck] = await Promise.all([
        getSpiritAnimals(),
        checkChildProfileLimit(session.user.id),
    ]);

    if (!result.success) {
        redirect("/login");
    }

    const spiritAnimals = result.data || [];

    // Check if user can add more children
    if (!limitCheck.allowed) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link href="/dashboard/children">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </Link>

                <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Đã đạt giới hạn profile</AlertTitle>
                    <AlertDescription>
                        <p className="mb-4">
                            Bạn đã sử dụng {limitCheck.current}/{limitCheck.limit} profiles với gói {getTierDisplayName(limitCheck.tier)}.
                            Vui lòng nâng cấp gói để thêm nhiều profile hơn.
                        </p>
                        <div className="flex gap-2">
                            <Link href="/dashboard/subscription">
                                <Button>
                                    Nâng cấp gói
                                </Button>
                            </Link>
                            <Link href="/dashboard/children">
                                <Button variant="outline">
                                    Quay lại
                                </Button>
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Back Button */}
            <Link href="/dashboard/children">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Thêm hồ sơ con</h1>
                <p className="text-muted-foreground">
                    Điền thông tin cơ bản về con bạn
                </p>
            </div>

            {/* Form */}
            <div className="bg-card border rounded-lg p-6">
                <ChildForm spiritAnimals={spiritAnimals} />
            </div>
        </div>
    );
}

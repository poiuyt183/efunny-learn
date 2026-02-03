import { getSpiritAnimals } from "@/features/children/actions/child-actions";
import { ChildForm } from "@/features/children/components/ChildForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewChildPage() {
    const result = await getSpiritAnimals();

    if (!result.success) {
        redirect("/login");
    }

    const spiritAnimals = result.data || [];

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

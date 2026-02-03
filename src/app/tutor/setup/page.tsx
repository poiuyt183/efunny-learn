import { redirect } from "next/navigation";
import { checkIsTutor } from "@/features/tutor/actions/tutor-actions";
import { TutorSetupForm } from "@/features/tutor/components/TutorSetupForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TutorSetupPage() {
    // Check if already has tutor profile
    const { hasProfile } = await checkIsTutor();

    if (hasProfile) {
        redirect("/tutor/dashboard");
    }

    return (
        <div className="container mx-auto max-w-4xl py-10 px-4">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Đăng ký làm Gia sư
                </h1>
                <p className="text-muted-foreground">
                    Tham gia cộng đồng gia sư Funny Learn và kết nối với hàng nghìn học sinh trên toàn quốc
                </p>
            </div>

            {/* Benefits */}
            <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle>Lợi ích khi tham gia</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-3 md:grid-cols-2">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm">Tự chủ về thời gian và địa điểm dạy học</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm">Nhận báo cáo AI chi tiết về học sinh</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm">Hệ thống match thông minh dựa trên dữ liệu</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm">Thanh toán nhanh chóng, minh bạch</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm">Hỗ trợ 24/7 từ đội ngũ Funny Learn</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span className="text-sm">Xây dựng danh tiếng qua hệ thống đánh giá</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Setup Form */}
            <TutorSetupForm />
        </div>
    );
}

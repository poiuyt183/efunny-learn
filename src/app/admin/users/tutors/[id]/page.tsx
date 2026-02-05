import { getTutorDetails } from "@/features/admin/queries";
import { PageHeader } from "../../../components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { notFound } from "next/navigation";
import { VerificationActions } from "./components/verification-actions";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

export default async function TutorDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const tutor = await getTutorDetails(id);

        const formatVND = (amount: number) => {
            return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(amount);
        };

        return (
            <div className="flex flex-col gap-4">
                <PageHeader
                    title={tutor.user.name}
                    description={`Tutor - ${tutor.verified ? "Verified" : "Pending Verification"}`}
                    breadcrumbs={[
                        { label: "Dashboard", href: "/admin" },
                        { label: "Tutors", href: "/admin/users/tutors" },
                        { label: tutor.user.name },
                    ]}
                    actions={!tutor.verified && <VerificationActions tutorId={id} />}
                />

                {!tutor.verified && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                        <div className="flex items-start gap-3">
                            <AlertCircleIcon className="mt-0.5 size-5 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                                    Verification Required
                                </h3>
                                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    This tutor is awaiting verification. Review their certificates
                                    and profile before approving.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Full Name</div>
                                <div className="font-medium">{tutor.user.name}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">Email</div>
                                <div className="font-medium">{tutor.user.email}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">Bio</div>
                                <div className="text-sm">{tutor.bio}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Account Created
                                </div>
                                <div className="font-medium">
                                    {format(new Date(tutor.user.createdAt), "PPP")} (
                                    {formatDistanceToNow(new Date(tutor.user.createdAt), {
                                        addSuffix: true,
                                    })}
                                    )
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Verification Status
                                </div>
                                {tutor.verified ? (
                                    <Badge variant="default" className="mt-1">
                                        <CheckCircle2Icon className="mr-1 size-3" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-600">
                                        <AlertCircleIcon className="mr-1 size-3" />
                                        Pending
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Teaching Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Teaching Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Subjects</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {tutor.subjects.map((subject) => (
                                        <Badge key={subject}>{subject}</Badge>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">Grades</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {tutor.grades.map((grade) => (
                                        <Badge key={grade} variant="secondary">
                                            Grade {grade}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Hourly Rate</div>
                                    <div className="text-xl font-bold">
                                        {formatVND(tutor.hourlyRate)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Rating</div>
                                    <div className="text-xl font-bold">
                                        {tutor.rating.toFixed(1)} ★
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Sessions
                                    </div>
                                    <div className="text-xl font-bold">{tutor.totalSessions}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Completion Rate
                                    </div>
                                    <div className="text-xl font-bold">
                                        {tutor.completionRate.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Certificates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tutor.certificates.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No certificates uploaded
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tutor.certificates.map((cert, index) => (
                                    <a
                                        key={cert}
                                        href={cert}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={cert}
                                            alt={`Certificate ${index + 1}`}
                                            className="aspect-[4/3] w-full object-cover"
                                        />
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bank Info */}
                {tutor.bankAccount && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Banking Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                Bank Account Number
                            </div>
                            <div className="font-mono font-medium">
                                {tutor.bankAccount.replace(/.(?=.{4})/g, "*")}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Booking History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tutor.bookings.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No bookings yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tutor.bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <div className="font-medium">{booking.child.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(booking.scheduledAt), "PPP")} •{" "}
                                                {booking.durationMinutes} minutes •{" "}
                                                {formatVND(booking.totalAmount)}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                booking.status === "COMPLETED"
                                                    ? "default"
                                                    : booking.status === "CANCELLED"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error) {
        notFound();
    }
}

import { getParentDetails } from "@/features/admin/queries";
import { PageHeader } from "../../../components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

export default async function ParentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const parent = await getParentDetails(id);

        const formatVND = (amount: number) => {
            return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(amount);
        };

        return (
            <div className="flex flex-col gap-4">
                <PageHeader
                    title={parent.name}
                    description={`Parent Account - ${parent.email}`}
                    breadcrumbs={[
                        { label: "Dashboard", href: "/admin" },
                        { label: "Parents", href: "/admin/users/parents" },
                        { label: parent.name },
                    ]}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Full Name</div>
                                <div className="font-medium">{parent.name}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">Email</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{parent.email}</span>
                                    {parent.emailVerified ? (
                                        <CheckCircle2Icon className="size-4 text-green-600" />
                                    ) : (
                                        <XCircleIcon className="size-4 text-red-600" />
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {parent.emailVerified ? "Verified" : "Not verified"}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Account Created
                                </div>
                                <div className="font-medium">
                                    {format(new Date(parent.createdAt), "PPP")} (
                                    {formatDistanceToNow(new Date(parent.createdAt), {
                                        addSuffix: true,
                                    })}
                                    )
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {parent.subscription ? (
                                <>
                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            Current Tier
                                        </div>
                                        <Badge
                                            variant={
                                                parent.subscription.tier === "PREMIUM"
                                                    ? "default"
                                                    : parent.subscription.tier === "BASIC"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            className="mt-1"
                                        >
                                            {parent.subscription.tier}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Status</div>
                                        <Badge
                                            variant={
                                                parent.subscription.status === "ACTIVE"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                            className="mt-1"
                                        >
                                            {parent.subscription.status}
                                        </Badge>
                                    </div>
                                    {parent.subscription.currentPeriodStart && (
                                        <>
                                            <Separator />
                                            <div>
                                                <div className="text-sm text-muted-foreground">
                                                    Billing Period
                                                </div>
                                                <div className="font-medium">
                                                    {format(
                                                        new Date(parent.subscription.currentPeriodStart),
                                                        "PPP",
                                                    )}{" "}
                                                    →{" "}
                                                    {format(
                                                        new Date(
                                                            parent.subscription.currentPeriodEnd || new Date(),
                                                        ),
                                                        "PPP",
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    No active subscription
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Children */}
                <Card>
                    <CardHeader>
                        <CardTitle>Children ({parent.children.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {parent.children.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No children registered
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {parent.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{child.name}</div>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>Grade {child.grade}</span>
                                                <span>•</span>
                                                <span>Level {child.level}</span>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="size-3 rounded-full"
                                                        style={{ backgroundColor: child.spiritAnimal.color }}
                                                    />
                                                    <span>{child.spiritAnimal.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/users/children/${child.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {parent.paymentHistory.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No payment history
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {parent.paymentHistory.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {payment.tier} Subscription
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(payment.createdAt), "PPP")}
                                                {payment.paidAt &&
                                                    ` • Paid ${formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })}`}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">
                                                {formatVND(payment.amount)}
                                            </span>
                                            <Badge
                                                variant={
                                                    payment.status === "SUCCESS"
                                                        ? "default"
                                                        : payment.status === "PENDING"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                        </div>
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

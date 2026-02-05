import { getChildDetails } from "@/features/admin/queries";
import { PageHeader } from "../../../components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function ChildDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const child = await getChildDetails(id);

        return (
            <div className="flex flex-col gap-4">
                <PageHeader
                    title={child.name}
                    description={`Grade ${child.grade} Student - Level ${child.level}`}
                    breadcrumbs={[
                        { label: "Dashboard", href: "/admin" },
                        { label: "Children", href: "/admin/users/children" },
                        { label: child.name },
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
                                <div className="font-medium">{child.name}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">Username</div>
                                <div className="font-medium">
                                    {child.username || "Not set"}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">Parent</div>
                                <div className="font-medium">{child.user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {child.user.email}
                                </div>
                                <Button variant="link" className="h-auto p-0" asChild>
                                    <Link href={`/admin/users/parents/${child.user.id}`}>
                                        View parent profile →
                                    </Link>
                                </Button>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Grade & Birth Year
                                </div>
                                <div className="font-medium">
                                    Grade {child.grade} • Born {child.birthYear}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Account Created
                                </div>
                                <div className="font-medium">
                                    {format(new Date(child.createdAt), "PPP")} (
                                    {formatDistanceToNow(new Date(child.createdAt), {
                                        addSuffix: true,
                                    })}
                                    )
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Learning Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Spirit Animal
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="size-4 rounded-full"
                                        style={{ backgroundColor: child.spiritAnimal.color }}
                                    />
                                    <span className="font-medium">
                                        {child.spiritAnimal.name}
                                    </span>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Level</div>
                                    <div className="text-2xl font-bold">{child.level}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Total XP</div>
                                    <div className="text-2xl font-bold">
                                        {child.xp.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Chat Sessions
                                </div>
                                <div className="font-medium">
                                    {child.chatSessions.length} sessions
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Total Questions Asked
                                </div>
                                <div className="font-medium">
                                    {child.totalQuestions} questions
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis Data */}
                {child.analysis && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Traits</div>
                                <div className="flex flex-wrap gap-2">
                                    {child.analysis.traits.map((trait) => (
                                        <Badge key={trait} variant="secondary">
                                            {trait}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Favorite Subjects
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {child.analysis.favoriteSubjects.map((subject) => (
                                        <Badge key={subject}>{subject}</Badge>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-sm text-muted-foreground">
                                    Learning Style
                                </div>
                                <div className="font-medium">
                                    {child.analysis.learningStyle || "Not analyzed yet"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Chat Sessions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Chat Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {child.chatSessions.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No chat sessions yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {child.chatSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {session.title || "Untitled Session"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {session._count.messages} messages •{" "}
                                                {formatDistanceToNow(new Date(session.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tutor Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tutor Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {child.bookings.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No tutor bookings yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {child.bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {booking.tutor.user.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(booking.scheduledAt), "PPP")} •{" "}
                                                {booking.durationMinutes} minutes
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

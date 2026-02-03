import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function LearnChatPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "CHILD") {
        redirect("/learn/login");
    }

    // Get child profile
    const childProfile = await prisma.child.findUnique({
        where: {
            childUserId: session.user.id,
        },
        include: {
            spiritAnimal: true,
        },
    });

    if (!childProfile) {
        redirect("/learn");
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="w-6 h-6" />
                            Chat với {childProfile.spiritAnimal.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Tính năng AI Chat đang được phát triển
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Bạn sẽ sớm có thể trò chuyện với Linh vật {childProfile.spiritAnimal.name} của mình!
                            </p>
                            <Button asChild>
                                <Link href="/learn">
                                    Quay lại Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

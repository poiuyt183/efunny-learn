import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  Trophy,
  Star,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default async function LearnDashboard() {
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
      dailyUsage: {
        where: {
          date: new Date().toISOString().split("T")[0],
        },
      },
      chatSessions: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!childProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Không tìm thấy thông tin học sinh
            </p>
            <Button asChild>
              <Link href="/learn/login">Quay lại</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todayUsage = childProfile.dailyUsage[0];
  const questionsAsked = todayUsage?.questionsAsked || 0;
  const maxQuestions = 5; // From FREE tier

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-2xl">{childProfile.spiritAnimal.slug === "dragon" ? "🐉" : childProfile.spiritAnimal.slug === "phoenix" ? "🦅" : childProfile.spiritAnimal.slug === "tiger" ? "🐯" : childProfile.spiritAnimal.slug === "turtle" ? "🐢" : "🦄"}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Chào {childProfile.name}! 👋
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                Linh vật: {childProfile.spiritAnimal.name}
                <Badge variant="secondary">
                  Level {childProfile.level}
                </Badge>
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/api/auth/signout">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Câu hỏi hôm nay</p>
                  <p className="text-2xl font-bold">
                    {questionsAsked}/{maxQuestions}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">{childProfile.level}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
                  <p className="text-2xl font-bold">{childProfile.xp} XP</p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lớp</p>
                  <p className="text-2xl font-bold">{childProfile.grade}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6" />
              Trò chuyện cùng {childProfile.spiritAnimal.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {childProfile.spiritAnimal.description}
            </p>
            <Button size="lg" className="w-full md:w-auto" asChild>
              <Link href="/learn/chat">
                Bắt đầu học ngay
                <MessageSquare className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {childProfile.chatSessions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cuộc trò chuyện gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {childProfile.chatSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/learn/chat/${session.id}`}
                    className="block p-3 hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {session.title || "Cuộc trò chuyện mới"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

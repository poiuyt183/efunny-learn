import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function LearnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Redirect if not logged in
    if (!session?.user) {
        redirect("/learn/login");
    }

    // Redirect if not a child account
    if (session.user.role !== "CHILD") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
            {children}
        </div>
    );
}

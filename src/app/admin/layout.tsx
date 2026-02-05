import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./components/admin-sidebar";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Double-check auth (middleware should catch this, but extra safety)
    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <SidebarProvider defaultOpen>
            <AdminSidebar user={session.user} />
            <SidebarInset>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

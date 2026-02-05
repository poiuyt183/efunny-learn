"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboardIcon,
    UsersIcon,
    BarChart3Icon,
    CalendarIcon,
    DollarSignIcon,
    ShieldAlertIcon,
    LogOutIcon,
    UserCircleIcon,
    BabyIcon,
    UserIcon,
    GraduationCapIcon,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

type User = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
};

const navItems = [
    {
        title: "Overview",
        icon: LayoutDashboardIcon,
        url: "/admin",
    },
    {
        title: "User Management",
        icon: UsersIcon,
        items: [
            {
                title: "Children",
                icon: BabyIcon,
                url: "/admin/users/children",
            },
            {
                title: "Parents",
                icon: UserIcon,
                url: "/admin/users/parents",
            },
            {
                title: "Tutors",
                icon: GraduationCapIcon,
                url: "/admin/users/tutors",
            },
        ],
    },
    {
        title: "Learning Analytics",
        icon: BarChart3Icon,
        url: "/admin/analytics",
        badge: "Soon",
    },
    {
        title: "Marketplace",
        icon: CalendarIcon,
        url: "/admin/marketplace",
        badge: "Soon",
    },
    {
        title: "Revenue",
        icon: DollarSignIcon,
        url: "/admin/revenue",
        badge: "Soon",
    },
    {
        title: "Safety & Moderation",
        icon: ShieldAlertIcon,
        url: "/admin/moderation",
        badge: "Soon",
    },
];

export function AdminSidebar({ user }: { user: User }) {
    const pathname = usePathname();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/auth/sign-in";
                },
            },
        });
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <span className="text-lg font-bold">FL</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">Funny Learn</span>
                        <span className="text-xs text-muted-foreground">Admin Panel</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = item.url === pathname;
                                const hasSubItems = item.items && item.items.length > 0;

                                if (hasSubItems) {
                                    const isParentActive = item.items?.some(
                                        (subItem) => subItem.url === pathname,
                                    );

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                isActive={isParentActive}
                                                tooltip={item.title}
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => {
                                                    const isSubActive = subItem.url === pathname;
                                                    return (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isSubActive}
                                                            >
                                                                <Link href={subItem.url}>
                                                                    <subItem.icon className="size-4" />
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </SidebarMenuItem>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url || "#"}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                                {item.badge && (
                                                    <span className="ml-auto text-xs text-muted-foreground">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="size-8">
                                        <AvatarImage src={user.image || undefined} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                            {user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                side="bottom"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="size-8">
                                            <AvatarImage
                                                src={user.image || undefined}
                                                alt={user.name}
                                            />
                                            <AvatarFallback>
                                                {user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                Admin
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <UserCircleIcon className="mr-2 size-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOutIcon className="mr-2 size-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}

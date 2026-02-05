"use client";

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================
// User Growth Chart (Line Chart)
// ============================================

type UserGrowthData = {
    date: string;
    users: number;
};

export function UserGrowthChart({ data }: { data: UserGrowthData[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "6px",
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="users"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            name="New Users"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ============================================
// Revenue Trend Chart (Area Chart)
// ============================================

type RevenueTrendData = {
    month: string;
    revenue: number;
};

export function RevenueTrendChart({ data }: { data: RevenueTrendData[] }) {
    const formatVND = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            notation: "compact",
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="month"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={formatVND}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "6px",
                            }}
                            formatter={(value: number) => formatVND(value)}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#revenueGradient)"
                            name="Revenue (VND)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ============================================
// Subscription Distribution Chart (Pie Chart)
// ============================================

type SubscriptionData = {
    tier: string;
    count: number;
};

const TIER_COLORS: Record<string, string> = {
    FREE: "#6b7280", // gray
    BASIC: "#3b82f6", // blue
    PREMIUM: "#f59e0b", // amber
};

export function SubscriptionChart({ data }: { data: SubscriptionData[] }) {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ tier, count }) =>
                                `${tier}: ${((count / total) * 100).toFixed(1)}%`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={`cell-${entry.tier}`}
                                    fill={TIER_COLORS[entry.tier] || "#8884d8"}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "6px",
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ============================================
// User Role Distribution Chart (Bar Chart)
// ============================================

type UserRoleData = {
    role: string;
    count: number;
};

const ROLE_COLORS: Record<string, string> = {
    PARENT: "#3b82f6", // blue
    CHILD: "#10b981", // green
    TUTOR: "#f59e0b", // amber
    ADMIN: "#ef4444", // red
};

export function UserRoleChart({ data }: { data: UserRoleData[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="role"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "6px",
                            }}
                        />
                        <Legend />
                        <Bar dataKey="count" name="Users" radius={[8, 8, 0, 0]}>
                            {data.map((entry) => (
                                <Cell
                                    key={`cell-${entry.role}`}
                                    fill={ROLE_COLORS[entry.role] || "#8884d8"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        direction: "up" | "down";
    };
    description?: string;
    className?: string;
};

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    description,
    className,
}: StatsCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trend || description) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {trend && (
                            <span
                                className={cn(
                                    "flex items-center gap-1 font-medium",
                                    trend.direction === "up"
                                        ? "text-green-600"
                                        : "text-red-600",
                                )}
                            >
                                {trend.direction === "up" ? (
                                    <ArrowUpIcon className="size-3" />
                                ) : (
                                    <ArrowDownIcon className="size-3" />
                                )}
                                {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description && <span>{description}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SUBSCRIPTION_PLANS, type SubscriptionTier, getTierDisplayName } from "@/lib/vnpay/config";

interface SubscriptionStatusCardProps {
    tier: SubscriptionTier;
    currentChildren: number;
}

export function SubscriptionStatusCard({ tier, currentChildren }: SubscriptionStatusCardProps) {
    const plan = SUBSCRIPTION_PLANS[tier];
    const maxChildren = plan.maxChildren;
    const usage = (currentChildren / maxChildren) * 100;
    const isAtLimit = currentChildren >= maxChildren;

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Gói đăng ký</h3>
                </div>
                <Badge variant={tier === "FREE" ? "outline" : tier === "BASIC" ? "secondary" : "default"}>
                    {getTierDisplayName(tier)}
                </Badge>
            </div>

            <div className="space-y-4">
                {/* Children Quota */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Profiles con</span>
                        <span className="font-medium">
                            {currentChildren}/{maxChildren}
                        </span>
                    </div>
                    <Progress value={usage} className="h-2" />
                    {isAtLimit && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Đã đạt giới hạn
                        </p>
                    )}
                </div>

                {/* Daily Questions */}
                <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Câu hỏi/ngày</span>
                        <span className="font-medium">
                            {plan.dailyQuestions === Infinity ? "Không giới hạn" : plan.dailyQuestions}
                        </span>
                    </div>
                </div>

                {/* Upgrade CTA */}
                {tier !== "PREMIUM" && (
                    <Link href="/dashboard/subscription" className="block pt-3 border-t">
                        <Button variant="outline" className="w-full" size="sm">
                            <span>Nâng cấp gói</span>
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                )}
            </div>
        </Card>
    );
}

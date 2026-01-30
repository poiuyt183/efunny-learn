import prisma from "./db";
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from "./vnpay/config";

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  tier: SubscriptionTier;
  upgradeUrl?: string;
}

export async function checkQuestionQuota(
  childId: string,
): Promise<QuotaCheckResult> {
  // Get child with parent subscription
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      user: {
        include: { subscription: true },
      },
    },
  });

  if (!child) {
    throw new Error("Child not found");
  }

  const tier = (child.user.subscription?.tier || "FREE") as SubscriptionTier;
  const limit = SUBSCRIPTION_PLANS[tier].dailyQuestions;

  // If unlimited (Premium)
  if (limit === Infinity) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      tier,
    };
  }

  // Get today's usage
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const usage = await prisma.dailyUsage.findUnique({
    where: {
      childId_date: {
        childId,
        date: today,
      },
    },
  });

  const questionsAsked = usage?.questionsAsked || 0;
  const remaining = Math.max(0, limit - questionsAsked);
  const allowed = questionsAsked < limit;

  return {
    allowed,
    remaining,
    limit,
    tier,
    upgradeUrl: allowed ? undefined : "/pricing",
  };
}

export async function incrementQuestionCount(childId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  await prisma.dailyUsage.upsert({
    where: {
      childId_date: {
        childId,
        date: today,
      },
    },
    create: {
      childId,
      date: today,
      questionsAsked: 1,
    },
    update: {
      questionsAsked: {
        increment: 1,
      },
    },
  });
}

export async function checkChildProfileLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  tier: SubscriptionTier;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      children: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = (user.subscription?.tier || "FREE") as SubscriptionTier;
  const limit = SUBSCRIPTION_PLANS[tier].maxChildren;
  const current = user.children.length;

  return {
    allowed: current < limit,
    current,
    limit,
    tier,
  };
}

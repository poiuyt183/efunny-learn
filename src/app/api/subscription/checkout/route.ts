import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import { sepay } from "@/lib/sepay";

const checkoutSchema = z.object({
  tier: z.enum(["BASIC", "PREMIUM"]),
});

const PRICING = {
  BASIC: 200000,
  PREMIUM: 500000,
};

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const headersList = await headers();
    const body = await req.json();

    const validated = checkoutSchema.parse(body);
    const amount = PRICING[validated.tier];

    // Create a unique order ID
    // Format: SUBS_{userId}_{timestamp}
    const orderId = `SUBS_${session.user.id.slice(0, 8)}_${Date.now()}`;
    const ipAddr = headersList.get("x-forwarded-for") || "127.0.0.1";

    const paymentUrl = sepay.buildPaymentUrl({
      amount,
      orderId,
      orderInfo: `Thanh toan goi ${validated.tier} cho user ${session.user.email}`,
      ipAddr,
      locale: "vi",
    });

    return NextResponse.json({ url: paymentUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create payment URL" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-utils";
import db from "@/lib/db";

const checkoutSchema = z.object({
  tier: z.enum(["BASIC", "PREMIUM"]),
});

const PRICING = {
  BASIC: 2000,
  PREMIUM: 5000,
};

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const tier = validated.tier;
    const amount = PRICING[tier];

    // Create a unique order ID (only letters and numbers for bank compatibility)
    // Format: SUBSuseridtimestamp (no special characters)
    const cleanUserId = session.user.id.replace(/[^a-zA-Z0-9]/g, '');
    const orderId = `SUBS${cleanUserId}${Date.now()}`;

    // Lưu pending payment vào database để track
    await db.paymentHistory.create({
      data: {
        userId: session.user.id,
        tier,
        amount,
        vnpayTransactionId: orderId,
        vnpayOrderId: orderId,
        status: "PENDING",
      },
    });

    console.log("💳 Created payment order:", {
      orderId,
      userId: session.user.id,
      cleanUserId,
      tier,
      amount,
    });

    // Build QR code URL
    const bankAccount = process.env.SO_TAI_KHOAN || "";
    const bankName = process.env.NGAN_HANG || "";
    const description = orderId; // Dùng orderId làm nội dung chuyển khoản

    const qrCodeUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${amount}&des=${description}`;
    console.log({ qrCodeUrl })

    return NextResponse.json({
      orderId,
      amount,
      qrCodeUrl,
      bankAccount,
      bankName,
      description,
      tier,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}

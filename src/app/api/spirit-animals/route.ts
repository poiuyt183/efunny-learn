import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const spiritAnimals = await prisma.spiritAnimal.findMany();
    return NextResponse.json(spiritAnimals);
  } catch (error) {
    console.error("Error fetching spirit animals:", error);
    return NextResponse.json(
      { error: "Failed to fetch spirit animals" },
      { status: 500 },
    );
  }
}

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("👨‍👩‍👧‍👦 Creating test parent user...");

  const email = "parent@test.com";
  const password = "password123";
  const name = "Test Parent";

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "PARENT",
      emailVerified: true,
      updatedAt: new Date(),
    },
    create: {
      id: `user_test_parent`,
      email,
      name,
      emailVerified: true,
      role: "PARENT",
      updatedAt: new Date(),
    },
  });

  // Create account with password
  await prisma.account.upsert({
    where: {
      id: `account_${user.id}`,
    },
    update: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
    create: {
      id: `account_${user.id}`,
      accountId: `account_${user.id}`,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("\n✅ Test parent created successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Email:", email);
  console.log("   Password:", password);
  console.log("\n🔗 Login at: http://localhost:3000/login");
}

main()
  .catch((e) => {
    console.error("❌ Failed to create test parent:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

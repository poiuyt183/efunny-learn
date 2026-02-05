import { PrismaClient as BasePrismaClient } from "@/generated/prisma/client";
import * as readline from "node:readline";

// Create a simple Prisma client without adapter for scripts
const prisma = new BasePrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function main() {
    console.log("🔐 Admin User Creator for Funny Learn\n");

    const email = await question("Enter email address to promote to ADMIN: ");

    const user = await prisma.user.findUnique({
        where: { email: email.trim() },
    });

    if (!user) {
        console.error(`❌ User with email "${email}" not found.`);
        console.log("\n💡 Create an account first by signing up at /auth/sign-up");
        process.exit(1);
    }

    if (user.role === "ADMIN") {
        console.log(`✅ User ${user.email} is already an ADMIN.`);
        process.exit(0);
    }

    await prisma.user.update({
        where: { email: email.trim() },
        data: { role: "ADMIN" },
    });

    console.log(`\n✅ Successfully promoted ${user.email} to ADMIN role!`);
    console.log(`\nYou can now access the admin panel at: http://localhost:3000/admin`);
}

main()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        rl.close();
    });

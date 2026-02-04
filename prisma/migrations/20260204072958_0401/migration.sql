/*
  Warnings:

  - A unique constraint covering the columns `[childUserId]` on the table `Child` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CHILD';

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "childUserId" TEXT;

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "amount" INTEGER NOT NULL,
    "vnpayTransactionId" TEXT NOT NULL,
    "vnpayOrderId" TEXT NOT NULL,
    "vnpayBankCode" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentHistory_vnpayTransactionId_key" ON "PaymentHistory"("vnpayTransactionId");

-- CreateIndex
CREATE INDEX "PaymentHistory_userId_idx" ON "PaymentHistory"("userId");

-- CreateIndex
CREATE INDEX "PaymentHistory_status_idx" ON "PaymentHistory"("status");

-- CreateIndex
CREATE INDEX "PaymentHistory_createdAt_idx" ON "PaymentHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Child_childUserId_key" ON "Child"("childUserId");

-- CreateIndex
CREATE INDEX "Child_childUserId_idx" ON "Child"("childUserId");

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_childUserId_fkey" FOREIGN KEY ("childUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

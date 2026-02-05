-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterEnum - Add new enum value (PostgreSQL safe method)
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PENDING_PAYMENT';

-- CreateTable
CREATE TABLE "BookingPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingIds" TEXT[],
    "totalAmount" INTEGER NOT NULL,
    "status" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BookingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingPayment_orderId_key" ON "BookingPayment"("orderId");

-- CreateIndex
CREATE INDEX "BookingPayment_orderId_idx" ON "BookingPayment"("orderId");

-- CreateIndex
CREATE INDEX "BookingPayment_userId_idx" ON "BookingPayment"("userId");

-- AlterTable (do this after enum is committed)
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

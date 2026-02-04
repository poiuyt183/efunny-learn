/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Child` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "pin" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Child_username_key" ON "Child"("username");

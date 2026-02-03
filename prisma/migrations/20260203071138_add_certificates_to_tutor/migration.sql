-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "certificates" TEXT[] DEFAULT ARRAY[]::TEXT[];

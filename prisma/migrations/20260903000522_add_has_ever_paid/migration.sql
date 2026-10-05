-- AlterTable
ALTER TABLE "pricing_plans" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasEverPaid" BOOLEAN NOT NULL DEFAULT false;

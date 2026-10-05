/*
  Warnings:

  - You are about to drop the column `yearlyDiscount` on the `pricing_plans` table. All the data in the column will be lost.
  - You are about to drop the column `yearlyPrice` on the `pricing_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpaySubscriptionId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quarterlyPrice` to the `pricing_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pricing_plans" DROP COLUMN "yearlyDiscount",
DROP COLUMN "yearlyPrice",
ADD COLUMN     "quarterlyDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quarterlyPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "razorpayPlanIdMonthly" TEXT,
ADD COLUMN     "razorpayPlanIdQuarterly" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "razorpayStatus" TEXT,
ADD COLUMN     "razorpaySubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "razorpayCustomerId" TEXT;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpayOrderId_key" ON "payments"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpayPaymentId_key" ON "payments"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpaySubscriptionId_key" ON "subscriptions"("razorpaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "users_razorpayCustomerId_key" ON "users"("razorpayCustomerId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

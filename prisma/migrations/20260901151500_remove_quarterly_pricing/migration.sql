-- Drop quarterly pricing columns from pricing_plans table
ALTER TABLE "pricing_plans" DROP COLUMN IF EXISTS "quarterlyPrice";
ALTER TABLE "pricing_plans" DROP COLUMN IF EXISTS "quarterlyDiscount";
ALTER TABLE "pricing_plans" DROP COLUMN IF EXISTS "razorpayPlanIdQuarterly";

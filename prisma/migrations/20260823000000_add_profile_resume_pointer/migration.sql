-- Stores the ID of the dedicated, hidden career-profile resume for each user.
-- The application creates the row only when the user explicitly saves Profile.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profileResumeId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_profileResumeId_key" ON "users"("profileResumeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_profileResumeId_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_profileResumeId_fkey"
      FOREIGN KEY ("profileResumeId") REFERENCES "resumes"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

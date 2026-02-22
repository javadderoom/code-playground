ALTER TABLE "problems"
ADD COLUMN "examples" jsonb NOT NULL DEFAULT '[]'::jsonb;

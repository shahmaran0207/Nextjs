-- AlterTable
ALTER TABLE "post" ALTER COLUMN "postview" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "posthate" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER,
    "userid" VARCHAR(1000),

    CONSTRAINT "posthate_pkey" PRIMARY KEY ("id")
);

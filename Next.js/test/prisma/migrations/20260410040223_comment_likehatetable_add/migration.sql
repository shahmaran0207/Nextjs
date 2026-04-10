-- CreateTable
CREATE TABLE "commentlike" (
    "id" SERIAL NOT NULL,
    "commentid" INTEGER,
    "userid" VARCHAR(1000),

    CONSTRAINT "commentlike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commenthate" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER,
    "userid" VARCHAR(1000),

    CONSTRAINT "commenthate_pkey" PRIMARY KEY ("id")
);

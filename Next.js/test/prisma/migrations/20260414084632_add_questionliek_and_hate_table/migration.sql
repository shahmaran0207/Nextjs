-- CreateTable
CREATE TABLE "questionlike" (
    "id" SERIAL NOT NULL,
    "questionid" INTEGER NOT NULL,
    "userid" VARCHAR(1000) NOT NULL,

    CONSTRAINT "questionlike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionhate" (
    "id" SERIAL NOT NULL,
    "questionid" INTEGER NOT NULL,
    "userid" VARCHAR(1000) NOT NULL,

    CONSTRAINT "questionhate_pkey" PRIMARY KEY ("id")
);

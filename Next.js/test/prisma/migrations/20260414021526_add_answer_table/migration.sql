-- CreateTable
CREATE TABLE "answer" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(1000),
    "content" VARCHAR(1000),
    "createdat" TIMESTAMP(6),
    "image" BYTEA,
    "questionid" INTEGER,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

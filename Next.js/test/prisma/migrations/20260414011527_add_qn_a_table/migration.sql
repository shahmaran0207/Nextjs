-- CreateTable
CREATE TABLE "qna" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(1000),
    "content" VARCHAR(1000),
    "createdat" TIMESTAMP(6),
    "image" BYTEA,
    "qnaview" INTEGER DEFAULT 0,
    "isend" INTEGER DEFAULT 0,

    CONSTRAINT "qna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answerlike" (
    "id" SERIAL NOT NULL,
    "questionid" INTEGER NOT NULL,
    "userid" VARCHAR(1000) NOT NULL,
    "answerid" INTEGER NOT NULL,

    CONSTRAINT "answerlike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answerhate" (
    "id" SERIAL NOT NULL,
    "questoinid" INTEGER NOT NULL,
    "userid" VARCHAR(1000) NOT NULL,
    "answerid" INTEGER NOT NULL,

    CONSTRAINT "answerhate_pkey" PRIMARY KEY ("id")
);

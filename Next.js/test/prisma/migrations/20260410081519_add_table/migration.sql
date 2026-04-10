-- CreateTable
CREATE TABLE "commentbycomment" (
    "id" SERIAL NOT NULL,
    "upprcommentid" INTEGER,
    "commenttitle" VARCHAR(1000),
    "commentcontent" VARCHAR(1000),
    "commentwriter" VARCHAR(1000),

    CONSTRAINT "commentbycomment_pkey" PRIMARY KEY ("id")
);

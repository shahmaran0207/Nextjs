-- CreateTable
CREATE TABLE "chat" (
    "id" SERIAL NOT NULL,
    "recepient" VARCHAR(1000),
    "sender" VARCHAR(1000),
    "content" VARCHAR(1000),
    "image" BYTEA,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link" (
    "sectionid" INTEGER NOT NULL,
    "linkid" VARCHAR(100) NOT NULL,
    "seq" DECIMAL,

    CONSTRAINT "link_pkey" PRIMARY KEY ("sectionid","linkid")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(1000),
    "content" VARCHAR(1000),
    "createdat" TIMESTAMP(6),
    "updatedat" TIMESTAMP(6),
    "image" BYTEA,
    "postview" INTEGER,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postcomment" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER,
    "commenttitle" VARCHAR(1000),
    "commentcontent" VARCHAR(1000),
    "commentwriter" VARCHAR(100),

    CONSTRAINT "postcomment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postlike" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER,
    "userid" VARCHAR(1000),

    CONSTRAINT "postlike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "road" (
    "id" SERIAL NOT NULL,
    "roadname" VARCHAR(600),

    CONSTRAINT "road_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section" (
    "id" SERIAL NOT NULL,
    "linkid" VARCHAR(4000),
    "roadid" INTEGER,
    "sectionname" VARCHAR(100),

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "naver_id" VARCHAR(3000),

    CONSTRAINT "users_pkey1" PRIMARY KEY ("id")
);

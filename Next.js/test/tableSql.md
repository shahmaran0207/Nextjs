SELECT current_database(), current_schema();

CREATE TABLE users (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100),
    naver_id VARCHAR(3000)
);

CREATE TABLE section (
    id          SERIAL PRIMARY KEY,
    linkid      VARCHAR(4000),
    roadid      INTEGER,
    sectionname VARCHAR(100)
);

CREATE TABLE road (
    id        SERIAL PRIMARY KEY,
    roadname  VARCHAR(600),
    sectionid VARCHAR(4000)
);

CREATE TABLE postlike (
    id     SERIAL PRIMARY KEY,
    postid INTEGER,
    userid VARCHAR(1000)
);

CREATE TABLE postcomment (
    id             SERIAL PRIMARY KEY,
    postid         INTEGER,
    commenttitle   VARCHAR(1000),
    commentcontent VARCHAR(1000),
    commentwriter  VARCHAR(100)
);

CREATE TABLE link (
    sectionid INTEGER,
    linkid    VARCHAR(100),
    seq       NUMERIC,
    PRIMARY KEY (sectionid, linkid)
);

CREATE TABLE chat (
    id        SERIAL PRIMARY KEY,
    recepient VARCHAR(1000),
    sender    VARCHAR(1000),
    content   VARCHAR(1000),
    image     BYTEA
);

CREATE TABLE post (
    id        SERIAL PRIMARY KEY,
    title     VARCHAR(1000),
    content   VARCHAR(1000),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    IMAGE     BYTEA,
    postView  INTEGER
);
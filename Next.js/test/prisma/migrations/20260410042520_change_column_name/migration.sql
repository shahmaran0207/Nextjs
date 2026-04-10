/*
  Warnings:

  - You are about to drop the column `postid` on the `commenthate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "commenthate" DROP COLUMN "postid",
ADD COLUMN     "commentid" INTEGER;

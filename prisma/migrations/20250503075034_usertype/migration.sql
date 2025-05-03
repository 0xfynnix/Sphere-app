-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ARTIST', 'GEEK', 'STORYTELLER', 'MEME_LORD', 'EXPLORER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType";

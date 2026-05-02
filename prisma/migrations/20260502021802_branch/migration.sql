-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'disabled');

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';

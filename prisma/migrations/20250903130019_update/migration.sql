/*
  Warnings:

  - Added the required column `fileName` to the `file` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."file" ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

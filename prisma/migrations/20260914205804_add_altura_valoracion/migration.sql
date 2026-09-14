/*
  Warnings:

  - Added the required column `altura` to the `Valoracion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Valoracion" ADD COLUMN     "altura" DOUBLE PRECISION NOT NULL;

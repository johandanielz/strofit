/*
  Warnings:

  - Added the required column `masaMagraInicial` to the `MetaNutricional` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MetaNutricional" ADD COLUMN     "masaMagraInicial" DOUBLE PRECISION NOT NULL;

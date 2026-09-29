/*
  Warnings:

  - You are about to drop the column `carbohidratosG100` on the `AlimentoBiblioteca` table. All the data in the column will be lost.
  - You are about to drop the column `grasaG100` on the `AlimentoBiblioteca` table. All the data in the column will be lost.
  - You are about to drop the column `proteinaG100` on the `AlimentoBiblioteca` table. All the data in the column will be lost.
  - Added the required column `carbohidratosGramos` to the `AlimentoBiblioteca` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gramosReferencia` to the `AlimentoBiblioteca` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grasaGramos` to the `AlimentoBiblioteca` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinaGramos` to the `AlimentoBiblioteca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlimentoBiblioteca" DROP COLUMN "carbohidratosG100",
DROP COLUMN "grasaG100",
DROP COLUMN "proteinaG100",
ADD COLUMN     "carbohidratosGramos" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "equivalencia" TEXT,
ADD COLUMN     "gramosReferencia" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "grasaGramos" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "proteinaGramos" DOUBLE PRECISION NOT NULL;

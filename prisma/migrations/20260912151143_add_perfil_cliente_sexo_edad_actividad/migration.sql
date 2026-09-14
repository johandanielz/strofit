/*
  Warnings:

  - Added the required column `factorActividad` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaNacimiento` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexo` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMENINO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "factorActividad" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sexo" "Sexo" NOT NULL;

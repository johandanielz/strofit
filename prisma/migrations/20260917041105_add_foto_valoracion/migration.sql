-- CreateEnum
CREATE TYPE "AnguloFoto" AS ENUM ('FRONTAL', 'ESPALDA', 'PERFIL_DERECHO', 'PERFIL_IZQUIERDO');

-- CreateTable
CREATE TABLE "FotoValoracion" (
    "id" TEXT NOT NULL,
    "valoracionId" TEXT NOT NULL,
    "angulo" "AnguloFoto" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FotoValoracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FotoValoracion_valoracionId_angulo_key" ON "FotoValoracion"("valoracionId", "angulo");

-- AddForeignKey
ALTER TABLE "FotoValoracion" ADD CONSTRAINT "FotoValoracion_valoracionId_fkey" FOREIGN KEY ("valoracionId") REFERENCES "Valoracion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

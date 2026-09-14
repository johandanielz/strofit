-- CreateTable
CREATE TABLE "CitaAgenda" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "realizada" BOOLEAN NOT NULL DEFAULT false,
    "cancelada" BOOLEAN NOT NULL DEFAULT false,
    "reagendada" BOOLEAN NOT NULL DEFAULT false,
    "fechaInicioOriginal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CitaAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CitaAgenda_clienteId_fechaInicio_idx" ON "CitaAgenda"("clienteId", "fechaInicio");

-- AddForeignKey
ALTER TABLE "CitaAgenda" ADD CONSTRAINT "CitaAgenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Valoracion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "citaAgendaId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "peso" DOUBLE PRECISION NOT NULL,
    "pliegueEscapular" DOUBLE PRECISION NOT NULL,
    "pliegueTricipital" DOUBLE PRECISION NOT NULL,
    "pliegueBicipital" DOUBLE PRECISION NOT NULL,
    "pliegueEctoral" DOUBLE PRECISION NOT NULL,
    "pliegueAxial" DOUBLE PRECISION NOT NULL,
    "pliegueSuprailico" DOUBLE PRECISION NOT NULL,
    "pliegueAbdominal" DOUBLE PRECISION NOT NULL,
    "pliegueEnPierna" DOUBLE PRECISION NOT NULL,
    "pliegueEnPantorrilla" DOUBLE PRECISION NOT NULL,
    "cuello" DOUBLE PRECISION NOT NULL,
    "brazoIzquierdo" DOUBLE PRECISION NOT NULL,
    "brazoDerecho" DOUBLE PRECISION NOT NULL,
    "hombros" DOUBLE PRECISION NOT NULL,
    "pecho" DOUBLE PRECISION NOT NULL,
    "antebrazoIzquierdo" DOUBLE PRECISION NOT NULL,
    "antebrazoDerecho" DOUBLE PRECISION NOT NULL,
    "cintura" DOUBLE PRECISION NOT NULL,
    "abdomen" DOUBLE PRECISION NOT NULL,
    "absBajo" DOUBLE PRECISION NOT NULL,
    "cadera" DOUBLE PRECISION NOT NULL,
    "piernaAltaIzquierda" DOUBLE PRECISION NOT NULL,
    "piernaAltaDerecha" DOUBLE PRECISION NOT NULL,
    "piernaIzquierda" DOUBLE PRECISION NOT NULL,
    "piernaDerecha" DOUBLE PRECISION NOT NULL,
    "piernaBajaIzquierda" DOUBLE PRECISION NOT NULL,
    "piernaBajaDerecha" DOUBLE PRECISION NOT NULL,
    "pantorrillaIzquierda" DOUBLE PRECISION NOT NULL,
    "pantorrillaDerecha" DOUBLE PRECISION NOT NULL,
    "puntoCriticoNombre" TEXT,
    "puntoCriticoMedida" DOUBLE PRECISION,
    "suma7Pliegues" DOUBLE PRECISION NOT NULL,
    "densidadCorporal" DOUBLE PRECISION NOT NULL,
    "porcentajeGrasa" DOUBLE PRECISION NOT NULL,
    "masaGrasa" DOUBLE PRECISION NOT NULL,
    "masaLibreGrasa" DOUBLE PRECISION NOT NULL,
    "imc" DOUBLE PRECISION NOT NULL,
    "caloriasBasales" DOUBLE PRECISION NOT NULL,
    "factorActividad" DOUBLE PRECISION NOT NULL,
    "caloriasTeoricas" DOUBLE PRECISION NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Valoracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Valoracion_citaAgendaId_key" ON "Valoracion"("citaAgendaId");

-- CreateIndex
CREATE INDEX "Valoracion_clienteId_fecha_idx" ON "Valoracion"("clienteId", "fecha");

-- CreateIndex
CREATE INDEX "Valoracion_deletedAt_idx" ON "Valoracion"("deletedAt");

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valoracion" ADD CONSTRAINT "Valoracion_citaAgendaId_fkey" FOREIGN KEY ("citaAgendaId") REFERENCES "CitaAgenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

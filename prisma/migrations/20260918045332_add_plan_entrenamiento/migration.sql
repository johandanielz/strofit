-- CreateTable
CREATE TABLE "CategoriaEjercicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CategoriaEjercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EjercicioBiblioteca" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "notasTecnicas" TEXT,
    "videoUrl" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EjercicioBiblioteca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Macrociclo" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Macrociclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Microciclo" (
    "id" TEXT NOT NULL,
    "macrocicloId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Microciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionEntrenamiento" (
    "id" TEXT NOT NULL,
    "microcicloId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SesionEntrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ejercicio" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "bibliotecaId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "numeroSeries" INTEGER NOT NULL,
    "repeticionesSugeridas" TEXT NOT NULL,
    "descansoSegundos" INTEGER NOT NULL,
    "rir" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Ejercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroSerie" (
    "id" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "numeroSerie" INTEGER NOT NULL,
    "carga" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "rir" TEXT,
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RegistroSerie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaEjercicio_nombre_key" ON "CategoriaEjercicio"("nombre");

-- CreateIndex
CREATE INDEX "CategoriaEjercicio_nombre_idx" ON "CategoriaEjercicio"("nombre");

-- CreateIndex
CREATE INDEX "CategoriaEjercicio_deletedAt_idx" ON "CategoriaEjercicio"("deletedAt");

-- CreateIndex
CREATE INDEX "EjercicioBiblioteca_categoriaId_idx" ON "EjercicioBiblioteca"("categoriaId");

-- CreateIndex
CREATE INDEX "EjercicioBiblioteca_deletedAt_idx" ON "EjercicioBiblioteca"("deletedAt");

-- CreateIndex
CREATE INDEX "Macrociclo_clienteId_idx" ON "Macrociclo"("clienteId");

-- CreateIndex
CREATE INDEX "Macrociclo_deletedAt_idx" ON "Macrociclo"("deletedAt");

-- CreateIndex
CREATE INDEX "Microciclo_deletedAt_idx" ON "Microciclo"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Microciclo_macrocicloId_numero_key" ON "Microciclo"("macrocicloId", "numero");

-- CreateIndex
CREATE INDEX "SesionEntrenamiento_deletedAt_idx" ON "SesionEntrenamiento"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SesionEntrenamiento_microcicloId_numero_key" ON "SesionEntrenamiento"("microcicloId", "numero");

-- CreateIndex
CREATE INDEX "Ejercicio_sesionId_orden_idx" ON "Ejercicio"("sesionId", "orden");

-- CreateIndex
CREATE INDEX "Ejercicio_deletedAt_idx" ON "Ejercicio"("deletedAt");

-- CreateIndex
CREATE INDEX "RegistroSerie_deletedAt_idx" ON "RegistroSerie"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroSerie_ejercicioId_numeroSerie_key" ON "RegistroSerie"("ejercicioId", "numeroSerie");

-- AddForeignKey
ALTER TABLE "EjercicioBiblioteca" ADD CONSTRAINT "EjercicioBiblioteca_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaEjercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Macrociclo" ADD CONSTRAINT "Macrociclo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Microciclo" ADD CONSTRAINT "Microciclo_macrocicloId_fkey" FOREIGN KEY ("macrocicloId") REFERENCES "Macrociclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionEntrenamiento" ADD CONSTRAINT "SesionEntrenamiento_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES "Microciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejercicio" ADD CONSTRAINT "Ejercicio_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionEntrenamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejercicio" ADD CONSTRAINT "Ejercicio_bibliotecaId_fkey" FOREIGN KEY ("bibliotecaId") REFERENCES "EjercicioBiblioteca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroSerie" ADD CONSTRAINT "RegistroSerie_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ObjetivoNutricional" AS ENUM ('DEFICIT', 'MANTENIMIENTO', 'SUPERAVIT');

-- CreateEnum
CREATE TYPE "TipoComida" AS ENUM ('DESAYUNO', 'MEDIA_MANANA', 'ALMUERZO', 'MERIENDA', 'POST_ENTRENO', 'COMIDA');

-- CreateTable
CREATE TABLE "AlimentoBiblioteca" (
    "id" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "proteinaG100" DOUBLE PRECISION NOT NULL,
    "carbohidratosG100" DOUBLE PRECISION NOT NULL,
    "grasaG100" DOUBLE PRECISION NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AlimentoBiblioteca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaNutricional" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "pesoInicial" DOUBLE PRECISION NOT NULL,
    "porcentajeGrasaInicial" DOUBLE PRECISION NOT NULL,
    "porcentajeGrasaObjetivo" DOUBLE PRECISION NOT NULL,
    "perdidaGrasaSemanalGramos" DOUBLE PRECISION NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MetaNutricional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanNutricional" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "valoracionId" TEXT NOT NULL,
    "objetivo" "ObjetivoNutricional" NOT NULL,
    "tasaSemanalPeso" DOUBLE PRECISION,
    "proteinaGramosPorKgLBM" DOUBLE PRECISION NOT NULL,
    "caloriasObjetivo" DOUBLE PRECISION NOT NULL,
    "proteinaG" DOUBLE PRECISION NOT NULL,
    "carbohidratosG" DOUBLE PRECISION NOT NULL,
    "grasasG" DOUBLE PRECISION NOT NULL,
    "aguaLitros" DOUBLE PRECISION,
    "pasosObjetivo" INTEGER,
    "cardioMinutosSemanal" INTEGER,
    "notas" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlanNutricional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanComida" (
    "id" TEXT NOT NULL,
    "planNutricionalId" TEXT NOT NULL,
    "tipo" "TipoComida" NOT NULL,
    "orden" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlanComida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlimentoComida" (
    "id" TEXT NOT NULL,
    "planComidaId" TEXT NOT NULL,
    "alimentoBibliotecaId" TEXT NOT NULL,
    "gramos" DOUBLE PRECISION NOT NULL,
    "orden" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AlimentoComida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlimentoBiblioteca_entrenadorId_idx" ON "AlimentoBiblioteca"("entrenadorId");

-- CreateIndex
CREATE INDEX "AlimentoBiblioteca_deletedAt_idx" ON "AlimentoBiblioteca"("deletedAt");

-- CreateIndex
CREATE INDEX "MetaNutricional_clienteId_idx" ON "MetaNutricional"("clienteId");

-- CreateIndex
CREATE INDEX "MetaNutricional_deletedAt_idx" ON "MetaNutricional"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlanNutricional_valoracionId_key" ON "PlanNutricional"("valoracionId");

-- CreateIndex
CREATE INDEX "PlanNutricional_clienteId_idx" ON "PlanNutricional"("clienteId");

-- CreateIndex
CREATE INDEX "PlanNutricional_deletedAt_idx" ON "PlanNutricional"("deletedAt");

-- CreateIndex
CREATE INDEX "PlanComida_deletedAt_idx" ON "PlanComida"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlanComida_planNutricionalId_tipo_key" ON "PlanComida"("planNutricionalId", "tipo");

-- CreateIndex
CREATE INDEX "AlimentoComida_planComidaId_idx" ON "AlimentoComida"("planComidaId");

-- CreateIndex
CREATE INDEX "AlimentoComida_deletedAt_idx" ON "AlimentoComida"("deletedAt");

-- AddForeignKey
ALTER TABLE "AlimentoBiblioteca" ADD CONSTRAINT "AlimentoBiblioteca_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaNutricional" ADD CONSTRAINT "MetaNutricional_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanNutricional" ADD CONSTRAINT "PlanNutricional_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanNutricional" ADD CONSTRAINT "PlanNutricional_valoracionId_fkey" FOREIGN KEY ("valoracionId") REFERENCES "Valoracion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanComida" ADD CONSTRAINT "PlanComida_planNutricionalId_fkey" FOREIGN KEY ("planNutricionalId") REFERENCES "PlanNutricional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlimentoComida" ADD CONSTRAINT "AlimentoComida_planComidaId_fkey" FOREIGN KEY ("planComidaId") REFERENCES "PlanComida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlimentoComida" ADD CONSTRAINT "AlimentoComida_alimentoBibliotecaId_fkey" FOREIGN KEY ("alimentoBibliotecaId") REFERENCES "AlimentoBiblioteca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

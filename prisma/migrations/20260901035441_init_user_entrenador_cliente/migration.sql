-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ENTRENADOR', 'CLIENTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrenador" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Entrenador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entrenadorId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_rol_idx" ON "User"("rol");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entrenador_userId_key" ON "Entrenador"("userId");

-- CreateIndex
CREATE INDEX "Entrenador_deletedAt_idx" ON "Entrenador"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_userId_key" ON "Cliente"("userId");

-- CreateIndex
CREATE INDEX "Cliente_entrenadorId_idx" ON "Cliente"("entrenadorId");

-- CreateIndex
CREATE INDEX "Cliente_deletedAt_idx" ON "Cliente"("deletedAt");

-- AddForeignKey
ALTER TABLE "Entrenador" ADD CONSTRAINT "Entrenador_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

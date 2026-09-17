'use server';

import { prismaFotoValoracionRepository } from '@/lib/valoracion/fotoValoracionRepository';
import type { AnguloFoto } from '@/generated/prisma/client';

export async function guardarRutaFoto(valoracionId: string, angulo: AnguloFoto, storagePath: string) {
    await prismaFotoValoracionRepository.guardarOReemplazar(valoracionId, angulo, storagePath);
}
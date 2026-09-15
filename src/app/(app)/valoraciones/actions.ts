// src/app/(app)/valoraciones/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { ValoracionService } from '@/lib/valoracion/valoracionService';
import { prismaValoracionRepository } from '@/lib/valoracion/valoracionRepository';
import { prismaClienteRepositoryParaValoracion } from '@/lib/valoracion/prismaClienteRepositoryParaValoracion';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { prisma } from '@/lib/db';

export type RegistrarValoracionActionState = {
    error?: string;
    success?: boolean;
};

export async function registrarValoracionAction(
    prevState: RegistrarValoracionActionState,
    formData: FormData
): Promise<RegistrarValoracionActionState> {
    const valoracionService = new ValoracionService(
        prismaValoracionRepository,
        prismaClienteRepositoryParaValoracion
    );

    const datos = Object.fromEntries(formData);

    const result = await valoracionService.registrar(datos);

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') {
            return { error: result.errors.join(', ') };
        }
        if (result.code === 'CLIENTE_NO_ENCONTRADO') {
            return { error: 'El cliente seleccionado no existe' };
        }
        if (result.code === 'ALTURA_OBLIGATORIA_PRIMERA_VALORACION') {
            return { error: 'Esta es la primera valoración del cliente, la altura es obligatoria' };
        }
        return {};
    }

    revalidatePath('/dashboard/clientes');
    return { success: true };
}

export async function obtenerClientesDelEntrenador() {
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    return prisma.cliente.findMany({
        where: { entrenadorId, deletedAt: null },
        select: { id: true, user: { select: { nombre: true } } },
        orderBy: { user: { nombre: 'asc' } },
    });
}

export async function obtenerAlturaSugerida(clienteId: string) {
    const ultimaValoracion = await prisma.valoracion.findFirst({
        where: { clienteId, deletedAt: null },
        orderBy: { fecha: 'desc' },
        select: { altura: true },
    });

    return ultimaValoracion?.altura ?? null;
}
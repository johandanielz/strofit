'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { AlimentoComidaService } from '@/lib/nutricion/alimentoComidaService';
import { prismaAlimentoComidaRepository } from '@/lib/nutricion/alimentoComidaRepository';

export type CrearAlimentoComidaActionState = { error?: string; success?: boolean };

export async function crearAlimentoComidaAction(
    prevState: CrearAlimentoComidaActionState,
    formData: FormData
): Promise<CrearAlimentoComidaActionState> {
    const planComidaId = formData.get('planComidaId') as string;

    const comida = await prisma.planComida.findUnique({
        where: { id: planComidaId },
        select: { planNutricional: { select: { clienteId: true } } },
    });
    if (!comida) {
        return { error: 'La comida no existe' };
    }

    try {
        const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
        await assertClienteDelEntrenador(comida.planNutricional.clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) return { error: 'No autorizado' };
        throw e;
    }

    const service = new AlimentoComidaService(prismaAlimentoComidaRepository);
    const result = await service.crear({
        planComidaId,
        alimentoBibliotecaId: formData.get('alimentoBibliotecaId'),
        gramos: formData.get('gramos'),
        orden: formData.get('orden'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'PLAN_COMIDA_NO_ENCONTRADA') return { error: 'La comida no existe' };
        if (result.code === 'ALIMENTO_BIBLIOTECA_NO_ENCONTRADO') return { error: 'El alimento no existe en el catálogo' };
        return {};
    }

    revalidatePath(`/nutricion/comida/${planComidaId}`);
    return { success: true };
}
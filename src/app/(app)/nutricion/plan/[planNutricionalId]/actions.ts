'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { PlanComidaService } from '@/lib/nutricion/planComidaService';
import { prismaPlanComidaRepository } from '@/lib/nutricion/planComidaRepository';

export type CrearPlanComidaActionState = { error?: string; success?: boolean };

export async function crearPlanComidaAction(
    prevState: CrearPlanComidaActionState,
    formData: FormData
): Promise<CrearPlanComidaActionState> {
    const planNutricionalId = formData.get('planNutricionalId') as string;

    const plan = await prisma.planNutricional.findUnique({
        where: { id: planNutricionalId },
        select: { clienteId: true },
    });
    if (!plan) {
        return { error: 'El plan no existe' };
    }

    try {
        const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
        await assertClienteDelEntrenador(plan.clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) return { error: 'No autorizado' };
        throw e;
    }

    const service = new PlanComidaService(prismaPlanComidaRepository);
    const result = await service.crear({
        planNutricionalId,
        tipo: formData.get('tipo'),
        orden: formData.get('orden'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'PLAN_NUTRICIONAL_NO_ENCONTRADO') return { error: 'El plan no existe' };
        if (result.code === 'TIPO_YA_EXISTE') return { error: 'Ya existe una comida de ese tipo en este plan' };
        return {};
    }

    revalidatePath(`/nutricion/plan/${planNutricionalId}`);
    return { success: true };
}
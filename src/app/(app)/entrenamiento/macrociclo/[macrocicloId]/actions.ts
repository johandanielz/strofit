'use server';

import { revalidatePath } from 'next/cache';
import { MicrocicloService } from '@/lib/entrenamiento/microcicloService';
import { prismaMicrocicloRepository } from '@/lib/entrenamiento/microcicloRepository';

export type CrearMicrocicloActionState = { error?: string; success?: boolean };

export async function crearMicrocicloAction(
    prevState: CrearMicrocicloActionState,
    formData: FormData
): Promise<CrearMicrocicloActionState> {
    const service = new MicrocicloService(prismaMicrocicloRepository);
    const macrocicloId = formData.get('macrocicloId') as string;

    const result = await service.crear({
        macrocicloId,
        numero: formData.get('numero'),
        fechaInicio: formData.get('fechaInicio'),
        fechaFin: formData.get('fechaFin'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'MACROCICLO_NO_ENCONTRADO') return { error: 'El macrociclo no existe' };
        if (result.code === 'NUMERO_YA_EXISTE') return { error: 'Ya existe un microciclo con ese número' };
        return {};
    }

    revalidatePath(`/entrenamiento/macrociclo/${macrocicloId}`);
    return { success: true };
}
'use server';

import { revalidatePath } from 'next/cache';
import { MacrocicloService } from '@/lib/entrenamiento/macrocicloService';
import { prismaMacrocicloRepository } from '@/lib/entrenamiento/macrocicloRepository';

export type CrearMacrocicloActionState = { error?: string; success?: boolean };

export async function crearMacrocicloAction(
    prevState: CrearMacrocicloActionState,
    formData: FormData
): Promise<CrearMacrocicloActionState> {
    const service = new MacrocicloService(prismaMacrocicloRepository);
    const result = await service.crear({
        clienteId: formData.get('clienteId'),
        fechaInicio: formData.get('fechaInicio'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') return { error: result.errors.join(', ') };
        if (result.code === 'CLIENTE_NO_ENCONTRADO') return { error: 'El cliente no existe' };
        return {};
    }

    revalidatePath(`/entrenamiento/${formData.get('clienteId')}`);
    return { success: true };
}
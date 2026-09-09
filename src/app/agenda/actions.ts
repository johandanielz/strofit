'use server';

import { revalidatePath } from 'next/cache';
import { AgendaService } from '@/lib/agenda/agendaService';
import { prismaAgendaRepository } from '@/lib/agenda/agendaRepository';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';

export type AgendarActionState = {
    error?: string;
    success?: boolean;
};

async function obtenerEntrenadorIdDeLaSesion(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('No hay sesión activa');
    }

    const entrenador = await prisma.entrenador.findFirst({
        where: { user: { supabaseUserId: user.id } },
    });

    if (!entrenador) {
        throw new Error('El usuario autenticado no es un entrenador');
    }

    return entrenador.id;
}

export async function agendarAction(
    prevState: AgendarActionState,
    formData: FormData
): Promise<AgendarActionState> {
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
    const agendaService = new AgendaService(prismaAgendaRepository);

    const result = await agendaService.agendar(entrenadorId, {
        clienteId: formData.get('clienteId'),
        fechaInicio: formData.get('fechaInicio'),
        observaciones: formData.get('observaciones') || undefined,
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') {
            return { error: result.errors.join(', ') };
        }
        if (result.code === 'HORARIO_PASADO') {
            return { error: 'No puedes agendar en una fecha u hora pasada' };
        }
        if (result.code === 'HORARIO_NO_DISPONIBLE') {
            return { error: 'Ese horario ya está ocupado por otra cita' };
        }
    }

    revalidatePath('/dashboard/agenda');
    return { success: true };
}
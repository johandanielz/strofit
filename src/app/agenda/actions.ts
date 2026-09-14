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

export type ReagendarActionState = {
    error?: string;
    success?: boolean;
};

export async function reagendarAction(
    prevState: ReagendarActionState,
    formData: FormData
): Promise<ReagendarActionState> {
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();
    const agendaService = new AgendaService(prismaAgendaRepository);

    const citaId = formData.get('citaId') as string;

    const result = await agendaService.reagendar(entrenadorId, citaId, {
        fechaInicio: formData.get('fechaInicio'),
    });

    if (!result.ok) {
        if (result.code === 'VALIDATION_ERROR') {
            return { error: result.errors.join(', ') };
        }
        if (result.code === 'HORARIO_PASADO') {
            return { error: 'No puedes reagendar a una fecha u hora pasada' };
        }
        if (result.code === 'HORARIO_NO_DISPONIBLE') {
            return { error: 'Ese horario ya está ocupado por otra cita' };
        }
        if (result.code === 'CITA_NO_ENCONTRADA') {
            return { error: 'La cita que intentas reagendar no existe' };
        }
    }

    revalidatePath('/dashboard/agenda');
    return { success: true };
}

export type CancelarActionState = {
    error?: string;
    success?: boolean;
};

export async function cancelarAction(
    prevState: CancelarActionState,
    formData: FormData
): Promise<CancelarActionState> {
    const agendaService = new AgendaService(prismaAgendaRepository);
    const citaId = formData.get('citaId') as string;

    const result = await agendaService.cancelar(citaId);

    if (!result.ok) {
        if (result.code === 'CITA_NO_ENCONTRADA') {
            return { error: 'La cita que intentas cancelar no existe' };
        }
        if (result.code === 'CITA_YA_REALIZADA') {
            return { error: 'No puedes cancelar una cita que ya fue realizada' };
        }
        if (result.code === 'CITA_YA_CANCELADA') {
            return { error: 'Esta cita ya estaba cancelada' };
        }
    }

    revalidatePath('/dashboard/agenda');
    return { success: true };
}
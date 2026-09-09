import { z } from 'zod';
import { AgendaRepository, AgendaCita } from './agendaRepository';

export const DURACION_VALORACION_MINUTOS = 15;

const agendarInputSchema = z.object({
    clienteId: z.string().min(1, 'El cliente es obligatorio'),
    fechaInicio: z.coerce.date({
        error: (issue) =>
            issue.input === undefined
                ? 'La fecha y hora son obligatorias'
                : 'La fecha y hora no son válidas',
    }),
    observaciones: z.string().optional(),
});

export type AgendarResult =
    | { ok: true; cita: AgendaCita }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'HORARIO_PASADO' }
    | { ok: false; code: 'HORARIO_NO_DISPONIBLE' };

export type ReagendarResult =
    | { ok: true; cita: AgendaCita }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'HORARIO_PASADO' }
    | { ok: false; code: 'HORARIO_NO_DISPONIBLE' }
    | { ok: false; code: 'CITA_NO_ENCONTRADA' };

export type CancelarResult =
    | { ok: true; cita: AgendaCita }
    | { ok: false; code: 'CITA_NO_ENCONTRADA' }
    | { ok: false; code: 'CITA_YA_REALIZADA' }
    | { ok: false; code: 'CITA_YA_CANCELADA' };

export class AgendaService {
    constructor(private readonly agendaRepo: AgendaRepository) {}

    async agendar(entrenadorId: string, input: unknown): Promise<AgendarResult> {
        const parsed = agendarInputSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const { clienteId, fechaInicio, observaciones } = parsed.data;

        // Criterio 4: no agendar en el pasado.
        if (fechaInicio.getTime() < Date.now()) {
            return { ok: false, code: 'HORARIO_PASADO' };
        }

        const fechaFin = new Date(fechaInicio.getTime() + DURACION_VALORACION_MINUTOS * 60_000);

        // Criterio 2: no permitir cruces de horario del entrenador.
        const cruce = await this.agendaRepo.existeCruce(entrenadorId, fechaInicio, fechaFin);
        if (cruce) {
            return { ok: false, code: 'HORARIO_NO_DISPONIBLE' };
        }

        const cita = await this.agendaRepo.crear({ clienteId, fechaInicio, fechaFin, observaciones });
        return { ok: true, cita };
    }

    async reagendar(entrenadorId: string, citaId: string, input: unknown): Promise<ReagendarResult> {
        const schema = z.object({
            fechaInicio: z.coerce.date({
                error: (issue) =>
                    issue.input === undefined
                        ? 'La fecha y hora son obligatorias'
                        : 'La fecha y hora no son válidas',
            }),
        });
        const parsed = schema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const existente = await this.agendaRepo.obtenerPorId(citaId);
        if (!existente) {
            return { ok: false, code: 'CITA_NO_ENCONTRADA' };
        }

        const nuevaFechaInicio = parsed.data.fechaInicio;
        if (nuevaFechaInicio.getTime() < Date.now()) {
            return { ok: false, code: 'HORARIO_PASADO' };
        }

        const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + DURACION_VALORACION_MINUTOS * 60_000);

        // Criterio 6: revalida cruces, excluyendo la propia cita que se está moviendo.
        const cruce = await this.agendaRepo.existeCruce(entrenadorId, nuevaFechaInicio, nuevaFechaFin, citaId);
        if (cruce) {
            return { ok: false, code: 'HORARIO_NO_DISPONIBLE' };
        }

        const cita = await this.agendaRepo.reagendar(citaId, nuevaFechaInicio, nuevaFechaFin);
        return { ok: true, cita };
    }

    async cancelar(citaId: string): Promise<CancelarResult> {
        const existente = await this.agendaRepo.obtenerPorId(citaId);
        if (!existente) {
            return { ok: false, code: 'CITA_NO_ENCONTRADA' };
        }

        if (existente.realizada) {
            return { ok: false, code: 'CITA_YA_REALIZADA' };
        }

        if (existente.cancelada) {
            return { ok: false, code: 'CITA_YA_CANCELADA' };
        }

        const cita = await this.agendaRepo.cancelar(citaId);
        return { ok: true, cita };
    }
}
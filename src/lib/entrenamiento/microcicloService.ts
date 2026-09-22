// src/lib/entrenamiento/microcicloService.ts
import { z } from 'zod';
import { MicrocicloRepository } from './microcicloRepository';

const crearMicrocicloSchema = z
    .object({
        macrocicloId: z.string().min(1, 'El macrociclo es obligatorio'),
        numero: z.coerce.number().int().positive('El número debe ser positivo'),
        fechaInicio: z.coerce.date(),
        fechaFin: z.coerce.date(),
    })
    .refine((data) => data.fechaFin > data.fechaInicio, {
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['fechaFin'],
    });

export type CrearMicrocicloResult =
    | { ok: true; microcicloId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'MACROCICLO_NO_ENCONTRADO' }
    | { ok: false; code: 'NUMERO_YA_EXISTE' };

export class MicrocicloService {
    constructor(private readonly repo: MicrocicloRepository) {}

    async crear(input: unknown): Promise<CrearMicrocicloResult> {
        const parsed = crearMicrocicloSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const macrocicloExiste = await this.repo.macrocicloExiste(parsed.data.macrocicloId);
        if (!macrocicloExiste) {
            return { ok: false, code: 'MACROCICLO_NO_ENCONTRADO' };
        }

        const numeroExiste = await this.repo.existeNumero(
            parsed.data.macrocicloId,
            parsed.data.numero
        );
        if (numeroExiste) {
            return { ok: false, code: 'NUMERO_YA_EXISTE' };
        }

        const microciclo = await this.repo.crear(parsed.data);
        return { ok: true, microcicloId: microciclo.id };
    }
}
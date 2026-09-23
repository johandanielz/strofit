import { z } from 'zod';
import { SesionRepository } from './sesionRepository';

const crearSesionSchema = z.object({
    microcicloId: z.string().min(1, 'El microciclo es obligatorio'),
    numero: z.coerce.number().int().positive('El número debe ser positivo'),
    fecha: z.coerce.date(),
});

export type CrearSesionResult =
    | { ok: true; sesionId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'MICROCICLO_NO_ENCONTRADO' }
    | { ok: false; code: 'NUMERO_YA_EXISTE' };

export class SesionService {
    constructor(private readonly repo: SesionRepository) {}

    async crear(input: unknown): Promise<CrearSesionResult> {
        const parsed = crearSesionSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const microcicloExiste = await this.repo.microcicloExiste(parsed.data.microcicloId);
        if (!microcicloExiste) {
            return { ok: false, code: 'MICROCICLO_NO_ENCONTRADO' };
        }

        const numeroExiste = await this.repo.existeNumero(
            parsed.data.microcicloId,
            parsed.data.numero
        );
        if (numeroExiste) {
            return { ok: false, code: 'NUMERO_YA_EXISTE' };
        }

        const sesion = await this.repo.crear(parsed.data);
        return { ok: true, sesionId: sesion.id };
    }
}
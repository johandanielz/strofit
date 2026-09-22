// src/lib/entrenamiento/macrocicloService.ts
import { z } from 'zod';
import { MacrocicloRepository } from './macrocicloRepository';

const crearMacrocicloSchema = z.object({
    clienteId: z.string().min(1, 'El cliente es obligatorio'),
    fechaInicio: z.coerce.date({
        error: (issue) =>
            issue.input === undefined
                ? 'La fecha de inicio es obligatoria'
                : 'La fecha de inicio no es válida',
    }),
});

export type CrearMacrocicloResult =
    | { ok: true; macrocicloId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'CLIENTE_NO_ENCONTRADO' };

export class MacrocicloService {
    constructor(private readonly repo: MacrocicloRepository) {}

    async crear(input: unknown): Promise<CrearMacrocicloResult> {
        const parsed = crearMacrocicloSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const clienteExiste = await this.repo.clienteExiste(parsed.data.clienteId);
        if (!clienteExiste) {
            return { ok: false, code: 'CLIENTE_NO_ENCONTRADO' };
        }

        const macrociclo = await this.repo.crear(parsed.data.clienteId, parsed.data.fechaInicio);
        return { ok: true, macrocicloId: macrociclo.id };
    }
}
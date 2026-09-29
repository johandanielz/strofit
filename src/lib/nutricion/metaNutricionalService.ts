import { z } from 'zod';
import { MetaNutricionalRepository } from './metaNutricionalRepository';

export interface ValoracionParaMeta {
    peso: number;
    porcentajeGrasa: number;
}

export interface ValoracionRepositoryParaMeta {
    obtenerUltimaValoracion(clienteId: string): Promise<ValoracionParaMeta | null>;
}

const crearMetaSchema = z.object({
    clienteId: z.string().min(1, 'El cliente es obligatorio'),
    porcentajeGrasaObjetivo: z.coerce.number().min(0, 'Debe ser un número positivo').max(100, 'No puede superar 100'),
    perdidaGrasaSemanalGramos: z.coerce.number().positive('Debe ser un número positivo'),
});

export type CrearMetaNutricionalResult =
    | { ok: true; metaNutricionalId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'CLIENTE_SIN_VALORACION' };

export class MetaNutricionalService {
    constructor(
        private readonly repo: MetaNutricionalRepository,
        private readonly valoracionRepo: ValoracionRepositoryParaMeta
    ) {}

    async crear(input: unknown): Promise<CrearMetaNutricionalResult> {
        const parsed = crearMetaSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const ultimaValoracion = await this.valoracionRepo.obtenerUltimaValoracion(parsed.data.clienteId);
        if (!ultimaValoracion) {
            return { ok: false, code: 'CLIENTE_SIN_VALORACION' };
        }

        const metaActiva = await this.repo.obtenerActivaPorCliente(parsed.data.clienteId);
        if (metaActiva) {
            await this.repo.desactivar(metaActiva.id);
        }

        const meta = await this.repo.crear({
            clienteId: parsed.data.clienteId,
            fechaInicio: new Date(),
            pesoInicial: ultimaValoracion.peso,
            porcentajeGrasaInicial: ultimaValoracion.porcentajeGrasa,
            porcentajeGrasaObjetivo: parsed.data.porcentajeGrasaObjetivo,
            perdidaGrasaSemanalGramos: parsed.data.perdidaGrasaSemanalGramos,
        });

        return { ok: true, metaNutricionalId: meta.id };
    }
}
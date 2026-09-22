import { z } from 'zod';
import { EjercicioRepository } from './ejercicioRepository';

const crearEjercicioSchema = z.object({
    sesionId: z.string().min(1, 'La sesión es obligatoria'),
    bibliotecaId: z.string().min(1, 'El ejercicio es obligatorio'),
    orden: z.coerce.number().int().positive('El orden debe ser positivo'),
    numeroSeries: z.coerce.number().int().positive('El número de series debe ser positivo'),
    repeticionesSugeridas: z.string().trim().min(1, 'Las repeticiones son obligatorias'),
    descansoSegundos: z.coerce.number().int().nonnegative('El descanso no puede ser negativo'),
    rir: z.string().optional(),
});

export type CrearEjercicioResult =
    | { ok: true; ejercicioId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'SESION_NO_ENCONTRADA' }
    | { ok: false; code: 'EJERCICIO_BIBLIOTECA_NO_ENCONTRADO' };

export class EjercicioService {
    constructor(private readonly repo: EjercicioRepository) {}

    async crear(input: unknown): Promise<CrearEjercicioResult> {
        const parsed = crearEjercicioSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const sesionExiste = await this.repo.sesionExiste(parsed.data.sesionId);
        if (!sesionExiste) {
            return { ok: false, code: 'SESION_NO_ENCONTRADA' };
        }

        const bibliotecaExiste = await this.repo.ejercicioBibliotecaExiste(
            parsed.data.bibliotecaId
        );
        if (!bibliotecaExiste) {
            return { ok: false, code: 'EJERCICIO_BIBLIOTECA_NO_ENCONTRADO' };
        }

        const ejercicio = await this.repo.crear(parsed.data);
        return { ok: true, ejercicioId: ejercicio.id };
    }
}
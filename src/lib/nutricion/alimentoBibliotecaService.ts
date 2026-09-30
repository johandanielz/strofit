import { z } from 'zod';
import { AlimentoBibliotecaRepository } from './alimentoBibliotecaRepository';

const textoOpcional = z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
);

const crearAlimentoSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    gramosReferencia: z.coerce.number().positive('Debe ser un número positivo'),
    proteinaGramos: z.coerce.number().min(0, 'La proteína no puede ser negativa'),
    carbohidratosGramos: z.coerce.number().min(0, 'Los carbohidratos no pueden ser negativos'),
    grasaGramos: z.coerce.number().min(0, 'La grasa no puede ser negativa'),
    equivalencia: textoOpcional,
});

export type CrearAlimentoBibliotecaResult =
    | { ok: true; alimentoBibliotecaId: string }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'ALIMENTO_YA_EXISTE' };

export class AlimentoBibliotecaService {
    constructor(private readonly repo: AlimentoBibliotecaRepository) {}

    async crear(input: unknown, entrenadorId: string): Promise<CrearAlimentoBibliotecaResult> {
        const parsed = crearAlimentoSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const existentes = await this.repo.listarPorEntrenador(entrenadorId);
        const yaExiste = existentes.some(
            (a) => a.nombre.toLowerCase() === parsed.data.nombre.toLowerCase()
        );

        if (yaExiste) {
            return { ok: false, code: 'ALIMENTO_YA_EXISTE' };
        }

        const alimento = await this.repo.crear({
            ...parsed.data,
            equivalencia: parsed.data.equivalencia ?? null,
            entrenadorId,
        });
        return { ok: true, alimentoBibliotecaId: alimento.id };
    }
}
import { z } from 'zod';
import { VALORES_FACTOR_ACTIVIDAD } from '../valoracion/factorActividad';

/**
 * Reglas de validación centralizadas. Se usan tanto en el formulario (cliente)
 * como en el server action (servidor) para no confiar únicamente en la
 * validación de UI — principio de defensa en profundidad.
 */

export const emailSchema = z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('El formato del email no es válido');

// Mínimo 8 caracteres, al menos una letra y un número (HU-02 criterio 6).
export const passwordSchema = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número');

// Solo dígitos, longitud entre 7 y 15.
export const telefonoSchema = z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos numéricos');

export const nombreSchema = z.string().trim().min(1, 'El nombre es obligatorio');

export const registerInputSchema = z.object({
    nombre: nombreSchema,
    email: emailSchema,
    telefono: telefonoSchema,
    password: passwordSchema,
});

export const loginInputSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;

/**
 * Valida un dato contra un schema de zod y devuelve un resultado uniforme,
 * en vez de forzar a cada caller a manejar excepciones de zod directamente.
 */
export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error.issues.map((i) => i.message) };
}

export const sexoSchema = z.enum(['MASCULINO', 'FEMENINO'], {
    error: () => 'El sexo es obligatorio',
});

export const fechaNacimientoSchema = z.coerce.date({
    error: (issue) =>
        issue.input === undefined
            ? 'La fecha de nacimiento es obligatoria'
            : 'La fecha de nacimiento no es válida',
});

export const factorActividadSchema = z
    .coerce.number()
    .refine((v) => (VALORES_FACTOR_ACTIVIDAD as readonly number[]).includes(v), {
        message: 'El factor de actividad no es válido',
    });

export const altaClienteInputSchema = z.object({
    nombre: nombreSchema,
    email: emailSchema,
    telefono: telefonoSchema,
    sexo: sexoSchema,
    fechaNacimiento: fechaNacimientoSchema,
    factorActividad: factorActividadSchema,
});

export type AltaClienteInput = z.infer<typeof altaClienteInputSchema>;
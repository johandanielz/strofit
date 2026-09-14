import { z } from 'zod';
import { calcularValoracion, Sexo } from './calculoValoracion';
import { ValoracionRepository, ValoracionCompleta } from './valoracionRepository';
import { VALORES_FACTOR_ACTIVIDAD } from './factorActividad';

export interface ClienteParaValoracion {
    sexo: Sexo;
    fechaNacimiento: Date;
    factorActividad: number;
}

export interface ClienteRepositoryParaValoracion {
    obtenerDatosParaValoracion(clienteId: string): Promise<ClienteParaValoracion | null>;
}

const pliegueSchema = z.coerce.number().positive('Debe ser un número positivo');
const medidaSchema = z.coerce.number().positive('Debe ser un número positivo');

const registrarValoracionSchema = z.object({
    clienteId: z.string().min(1, 'El cliente es obligatorio'),
    citaAgendaId: z.string().optional(),
    fecha: z.coerce.date(),
    peso: z.coerce.number().positive('El peso debe ser un número positivo'),
    altura: z.coerce.number().positive().optional(),

    pliegueEctoral: pliegueSchema,
    pliegueAxial: pliegueSchema,
    pliegueTricipital: pliegueSchema,
    pliegueEscapular: pliegueSchema,
    pliegueBicipital: pliegueSchema,
    pliegueAbdominal: pliegueSchema,
    pliegueSuprailico: pliegueSchema,
    pliegueEnPierna: pliegueSchema,
    pliegueEnPantorrilla: pliegueSchema,

    cuello: medidaSchema,
    brazoIzquierdo: medidaSchema,
    brazoDerecho: medidaSchema,
    hombros: medidaSchema,
    pecho: medidaSchema,
    antebrazoIzquierdo: medidaSchema,
    antebrazoDerecho: medidaSchema,
    cintura: medidaSchema,
    abdomen: medidaSchema,
    absBajo: medidaSchema,
    cadera: medidaSchema,
    piernaAltaIzquierda: medidaSchema,
    piernaAltaDerecha: medidaSchema,
    piernaIzquierda: medidaSchema,
    piernaDerecha: medidaSchema,
    piernaBajaIzquierda: medidaSchema,
    piernaBajaDerecha: medidaSchema,
    pantorrillaIzquierda: medidaSchema,
    pantorrillaDerecha: medidaSchema,

    puntoCriticoNombre: z.string().optional(),
    puntoCriticoMedida: z.coerce.number().positive().optional(),
});

export type RegistrarValoracionResult =
    | { ok: true; valoracion: ValoracionCompleta }
    | { ok: false; code: 'VALIDATION_ERROR'; errors: string[] }
    | { ok: false; code: 'CLIENTE_NO_ENCONTRADO' }
    | { ok: false; code: 'ALTURA_OBLIGATORIA_PRIMERA_VALORACION' };

export class ValoracionService {
    constructor(
        private readonly valoracionRepo: ValoracionRepository,
        private readonly clienteRepo: ClienteRepositoryParaValoracion
    ) {}

    async registrar(input: unknown): Promise<RegistrarValoracionResult> {
        const parsed = registrarValoracionSchema.safeParse(input);
        if (!parsed.success) {
            return {
                ok: false,
                code: 'VALIDATION_ERROR',
                errors: parsed.error.issues.map((i) => i.message),
            };
        }

        const datosCliente = await this.clienteRepo.obtenerDatosParaValoracion(parsed.data.clienteId);
        if (!datosCliente) {
            return { ok: false, code: 'CLIENTE_NO_ENCONTRADO' };
        }

        const historial = await this.valoracionRepo.obtenerHistorialPorCliente(parsed.data.clienteId);
        const ultimaValoracion = historial[historial.length - 1];

        let altura = parsed.data.altura;
        if (altura === undefined) {
            if (!ultimaValoracion) {
                return { ok: false, code: 'ALTURA_OBLIGATORIA_PRIMERA_VALORACION' };
            }
            altura = ultimaValoracion.altura;
        }

        const calculado = calcularValoracion({
            sexo: datosCliente.sexo,
            fechaNacimiento: datosCliente.fechaNacimiento,
            fecha: parsed.data.fecha,
            peso: parsed.data.peso,
            altura,
            factorActividad: datosCliente.factorActividad,
            pliegueEctoral: parsed.data.pliegueEctoral,
            pliegueAxial: parsed.data.pliegueAxial,
            pliegueTricipital: parsed.data.pliegueTricipital,
            pliegueEscapular: parsed.data.pliegueEscapular,
            pliegueAbdominal: parsed.data.pliegueAbdominal,
            pliegueSuprailico: parsed.data.pliegueSuprailico,
            pliegueEnPierna: parsed.data.pliegueEnPierna,
        });

        const valoracion = await this.valoracionRepo.crear({
            ...parsed.data,
            clienteId: parsed.data.clienteId,
            citaAgendaId: parsed.data.citaAgendaId ?? null,
            fecha: parsed.data.fecha,
            peso: parsed.data.peso,
            altura,
            puntoCriticoNombre: parsed.data.puntoCriticoNombre ?? null,
            puntoCriticoMedida: parsed.data.puntoCriticoMedida ?? null,
            factorActividad: datosCliente.factorActividad,
            ...calculado,
        });

        return { ok: true, valoracion };
    }
}
import { ValoracionService } from '../src/lib/valoracion/valoracionService';
import {
    ValoracionRepository,
    ValoracionCompleta,
    DatosCrearValoracion,
} from '../src/lib/valoracion/valoracionRepository';
import { ClienteRepositoryParaValoracion, ClienteParaValoracion } from '../src/lib/valoracion/valoracionService';

function makeFakeValoracionRepo(seed: ValoracionCompleta[] = []): ValoracionRepository {
    const valoraciones = [...seed];
    return {
        async crear(data: DatosCrearValoracion) {
            const nueva = { ...data, id: `val-${valoraciones.length + 1}`, deletedAt: null } as ValoracionCompleta;
            valoraciones.push(nueva);
            return nueva;
        },
        async obtenerHistorialPorCliente(clienteId) {
            return valoraciones
                .filter((v) => v.clienteId === clienteId)
                .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        },
        async obtenerPorId(id) {
            return valoraciones.find((v) => v.id === id) ?? null;
        },
    };
}

function makeFakeClienteRepo(datos: ClienteParaValoracion | null): ClienteRepositoryParaValoracion {
    return {
        async obtenerDatosParaValoracion() {
            return datos;
        },
    };
}

const datosClienteValidos: ClienteParaValoracion = {
    sexo: 'MASCULINO',
    fechaNacimiento: new Date('1998-08-12'),
    factorActividad: 1.375,
};

const inputBase = {
    clienteId: 'cliente-1',
    fecha: new Date('2025-08-12'),
    peso: 98.15,
    altura: 1.94,
    pliegueEctoral: 14,
    pliegueAxial: 18,
    pliegueTricipital: 16,
    pliegueEscapular: 17,
    pliegueBicipital: 8,
    pliegueAbdominal: 44,
    pliegueSuprailico: 46,
    pliegueEnPierna: 23,
    pliegueEnPantorrilla: 17,
    cuello: 38.5,
    brazoIzquierdo: 37,
    brazoDerecho: 37.5,
    hombros: 121,
    pecho: 106,
    antebrazoIzquierdo: 29,
    antebrazoDerecho: 29,
    cintura: 94,
    abdomen: 98,
    absBajo: 98,
    cadera: 110,
    piernaAltaIzquierda: 65,
    piernaAltaDerecha: 65,
    piernaIzquierda: 60,
    piernaDerecha: 60,
    piernaBajaIzquierda: 58,
    piernaBajaDerecha: 58,
    pantorrillaIzquierda: 40.5,
    pantorrillaDerecha: 40.5,
};

describe('HU-05: ValoracionService.registrar', () => {
    // Criterio 1: datos válidos crean la valoración con los cálculos correctos
    test('registra la primera valoración de un cliente y calcula todo correctamente', async () => {
        const service = new ValoracionService(
            makeFakeValoracionRepo(),
            makeFakeClienteRepo(datosClienteValidos)
        );

        const result = await service.registrar(inputBase);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.valoracion.suma7Pliegues).toBe(178);
            expect(result.valoracion.porcentajeGrasa).toBeCloseTo(24.04, 1);
        }
    });

    // Nuevo: primera valoración sin altura -> error
    test('rechaza la primera valoración si no se envía altura', async () => {
        const service = new ValoracionService(
            makeFakeValoracionRepo(),
            makeFakeClienteRepo(datosClienteValidos)
        );

        const { altura, ...sinAltura } = inputBase;
        const result = await service.registrar(sinAltura);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('ALTURA_OBLIGATORIA_PRIMERA_VALORACION');
    });

    // Nuevo: segunda valoración sin altura -> se usa la de la anterior
    test('sugiere la altura de la valoración anterior si no se envía una nueva', async () => {
        const valoracionAnterior = {
            ...inputBase,
            id: 'val-anterior',
            citaAgendaId: null,
            deletedAt: null,
            fecha: new Date('2025-01-01'),
            altura: 1.94,
        } as unknown as ValoracionCompleta;

        const service = new ValoracionService(
            makeFakeValoracionRepo([valoracionAnterior]),
            makeFakeClienteRepo(datosClienteValidos)
        );

        const { altura, ...sinAltura } = inputBase;
        const result = await service.registrar(sinAltura);

        expect(result.ok).toBe(true);
        if (result.ok) expect(result.valoracion.altura).toBe(1.94);
    });

    // Nuevo: cliente inexistente
    test('rechaza si el cliente no existe', async () => {
        const service = new ValoracionService(makeFakeValoracionRepo(), makeFakeClienteRepo(null));

        const result = await service.registrar(inputBase);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CLIENTE_NO_ENCONTRADO');
    });

    // Criterio 4: campos obligatorios
    test('rechaza si falta un pliegue obligatorio', async () => {
        const service = new ValoracionService(
            makeFakeValoracionRepo(),
            makeFakeClienteRepo(datosClienteValidos)
        );

        const { pliegueAxial, ...sinPliegue } = inputBase;
        const result = await service.registrar(sinPliegue);

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    // Criterio 5: valores fuera de rango razonable
    test('rechaza un peso negativo', async () => {
        const service = new ValoracionService(
            makeFakeValoracionRepo(),
            makeFakeClienteRepo(datosClienteValidos)
        );

        const result = await service.registrar({ ...inputBase, peso: -10 });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });
});
import { AgendaService, DURACION_VALORACION_MINUTOS } from '../src/lib/agenda/agendaService';
import { AgendaRepository, AgendaCita } from '../src/lib/agenda/agendaRepository';

function makeFakeAgendaRepo(seed: AgendaCita[] = []): AgendaRepository {
    const citas = [...seed];

    return {
        async existeCruce(entrenadorId, inicio, fin, excluirCitaId) {
            return citas.some((c) => {
                if (excluirCitaId && c.id === excluirCitaId) return false;
                if (c.cancelada) return false;
                return c.fechaInicio < fin && c.fechaFin > inicio;
            });
        },
        async crear(data) {
            const nueva: AgendaCita = {
                id: `cita-${citas.length + 1}`,
                clienteId: data.clienteId,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                observaciones: data.observaciones ?? null,
                realizada: false,
                cancelada: false,
                reagendada: false,
                fechaInicioOriginal: null,
            };
            citas.push(nueva);
            return nueva;
        },
        async obtenerPorId(id) {
            return citas.find((c) => c.id === id) ?? null;
        },
        async reagendar(id, nuevaFechaInicio, nuevaFechaFin) {
            const cita = citas.find((c) => c.id === id)!;
            cita.fechaInicioOriginal = cita.fechaInicioOriginal ?? cita.fechaInicio;
            cita.fechaInicio = nuevaFechaInicio;
            cita.fechaFin = nuevaFechaFin;
            cita.reagendada = true;
            return cita;
        },
        async cancelar(id) {
            const cita = citas.find((c) => c.id === id)!;
            cita.cancelada = true;
            return cita;
        },
    };
}

const ENTRENADOR_ID = 'entrenador-1';
const CLIENTE_ID = 'cliente-1';

// Fecha fija en el futuro, para que las pruebas no dependan de "ahora mismo".
const MANANA_10AM = new Date(Date.now() + 24 * 60 * 60 * 1000);
MANANA_10AM.setHours(10, 0, 0, 0);

describe('HU-04: AgendaService.agendar', () => {
    // Criterio 1: calcula automáticamente la hora de fin
    test('agenda exitosamente y calcula fechaFin con el colchón de 15 minutos', async () => {
        const repo = makeFakeAgendaRepo();
        const service = new AgendaService(repo);

        const result = await service.agendar(ENTRENADOR_ID, {
            clienteId: CLIENTE_ID,
            fechaInicio: MANANA_10AM,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            const duracionMs = result.cita.fechaFin.getTime() - result.cita.fechaInicio.getTime();
            expect(duracionMs).toBe(DURACION_VALORACION_MINUTOS * 60_000);
        }
    });

    // Criterio 2: no permite cruces de horario
    test('rechaza agendar si hay cruce de horario con otra cita del entrenador', async () => {
        const citaExistente: AgendaCita = {
            id: 'cita-existente',
            clienteId: 'otro-cliente',
            fechaInicio: MANANA_10AM,
            fechaFin: new Date(MANANA_10AM.getTime() + 15 * 60_000),
            observaciones: null,
            realizada: false,
            cancelada: false,
            reagendada: false,
            fechaInicioOriginal: null,
        };
        const repo = makeFakeAgendaRepo([citaExistente]);
        const service = new AgendaService(repo);

        // Intenta agendar 5 minutos después de que empezó la existente -> se cruzan.
        const nuevaFechaInicio = new Date(MANANA_10AM.getTime() + 5 * 60_000);

        const result = await service.agendar(ENTRENADOR_ID, {
            clienteId: CLIENTE_ID,
            fechaInicio: nuevaFechaInicio,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('HORARIO_NO_DISPONIBLE');
    });

    // Criterio 3: campos obligatorios
    test('rechaza si falta el clienteId', async () => {
        const repo = makeFakeAgendaRepo();
        const service = new AgendaService(repo);

        const result = await service.agendar(ENTRENADOR_ID, {
            clienteId: '',
            fechaInicio: MANANA_10AM,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
    });

    // Criterio 4: no agendar en el pasado
    test('rechaza agendar en una fecha/hora pasada', async () => {
        const repo = makeFakeAgendaRepo();
        const service = new AgendaService(repo);
        const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await service.agendar(ENTRENADOR_ID, {
            clienteId: CLIENTE_ID,
            fechaInicio: ayer,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('HORARIO_PASADO');
    });
});

describe('HU-04: AgendaService.reagendar', () => {
    // Criterio 6: modificar una cita, revalida cruces
    test('reagenda exitosamente y guarda la fecha original', async () => {
        const citaOriginal: AgendaCita = {
            id: 'cita-1',
            clienteId: CLIENTE_ID,
            fechaInicio: MANANA_10AM,
            fechaFin: new Date(MANANA_10AM.getTime() + 15 * 60_000),
            observaciones: null,
            realizada: false,
            cancelada: false,
            reagendada: false,
            fechaInicioOriginal: null,
        };
        const repo = makeFakeAgendaRepo([citaOriginal]);
        const service = new AgendaService(repo);

        const nuevaFecha = new Date(MANANA_10AM.getTime() + 60 * 60_000); // 1 hora después

        const result = await service.reagendar(ENTRENADOR_ID, 'cita-1', {
            fechaInicio: nuevaFecha,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.cita.reagendada).toBe(true);
            expect(result.cita.fechaInicioOriginal).toEqual(MANANA_10AM);
        }
    });

    // No debe chocar consigo misma al revalidar cruces
    test('al reagendar, no se considera un cruce contra sí misma', async () => {
        const cita: AgendaCita = {
            id: 'cita-1',
            clienteId: CLIENTE_ID,
            fechaInicio: MANANA_10AM,
            fechaFin: new Date(MANANA_10AM.getTime() + 15 * 60_000),
            observaciones: null,
            realizada: false,
            cancelada: false,
            reagendada: false,
            fechaInicioOriginal: null,
        };
        const repo = makeFakeAgendaRepo([cita]);
        const service = new AgendaService(repo);

        // La "reagenda" a la misma hora exacta -> no debería fallar por chocar consigo misma.
        const result = await service.reagendar(ENTRENADOR_ID, 'cita-1', {
            fechaInicio: MANANA_10AM,
        });

        expect(result.ok).toBe(true);
    });

    // Cita inexistente
    test('rechaza reagendar una cita que no existe', async () => {
        const repo = makeFakeAgendaRepo();
        const service = new AgendaService(repo);

        const result = await service.reagendar(ENTRENADOR_ID, 'no-existe', {
            fechaInicio: MANANA_10AM,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.code).toBe('CITA_NO_ENCONTRADA');
    });
});
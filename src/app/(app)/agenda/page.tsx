import { obtenerSemanaCalendario, obtenerClientesParaAgendar } from './actions';
import { CalendarioSemana } from './CalendarioSemana';

function obtenerInicioDeSemana(fecha: Date): Date {
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia; // ajusta para que la semana empiece en lunes
    const inicio = new Date(fecha);
    inicio.setDate(fecha.getDate() + diferencia);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
}

export default async function AgendaPage() {
    const inicioSemana = obtenerInicioDeSemana(new Date());
    const [dias, clientes] = await Promise.all([
        obtenerSemanaCalendario(inicioSemana),
        obtenerClientesParaAgendar(),
    ]);

    // Serializamos las fechas a ISO string antes de pasarlas al Client Component.
    const diasSerializados = dias.map((dia) => ({
        ...dia,
        fecha: dia.fecha.toISOString(),
        franjas: dia.franjas.map((f) => ({
            ...f,
            cita: f.cita
                ? {
                      id: f.cita.id,
                      clienteId: f.cita.clienteId,
                      cancelada: f.cita.cancelada,
                      cliente: { user: { nombre: f.cita.cliente.user.nombre } },
                  }
                : null,
        })),
    }));

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Agenda de la semana</h1>
            <CalendarioSemana dias={diasSerializados} clientes={clientes} />
        </div>
    );
}
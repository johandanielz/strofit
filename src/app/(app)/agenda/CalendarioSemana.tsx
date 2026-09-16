'use client';

import { useState, useEffect } from 'react';
import { agendarAction, reagendarAction, cancelarAction } from './actions';
import { useActionState } from 'react';

interface Cliente {
    id: string;
    user: { nombre: string };
}

interface Cita {
    id: string;
    clienteId: string;
    cancelada: boolean;
    cliente: { user: { nombre: string } };
}

interface Franja {
    hora: string;
    disponible: boolean;
    cita: Cita | null;
}

interface Dia {
    fecha: string; // ISO, ya serializada desde el servidor
    diaSemana: number;
    franjas: Franja[];
}

const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function CalendarioSemana({ dias, clientes }: { dias: Dia[]; clientes: Cliente[] }) {
    const [franjaSeleccionada, setFranjaSeleccionada] = useState<{ fecha: string; hora: string } | null>(null);
    const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

    // Unimos todas las horas únicas de todos los días, para tener filas consistentes en la tabla.
    const horasUnicas = Array.from(new Set(dias.flatMap((d) => d.franjas.map((f) => f.hora)))).sort();

    function celdaDe(dia: Dia, hora: string): Franja | undefined {
        return dia.franjas.find((f) => f.hora === hora);
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="border border-[#E8E6DF] p-2 text-left text-black">Hora</th>
                            {dias.map((dia) => (
                                <th key={dia.fecha} className="border border-[#E8E6DF] p-2 text-left text-black">
                                    {NOMBRES_DIA[dia.diaSemana]} {new Date(dia.fecha).getDate()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {horasUnicas.map((hora) => (
                            <tr key={hora}>
                                <td className="border border-[#E8E6DF] p-2 font-medium text-[#3D3D3A]">{hora}</td>
                                {dias.map((dia) => {
                                    const franja = celdaDe(dia, hora);

                                    if (!franja) {
                                        return <td key={dia.fecha} className="border border-[#E8E6DF] bg-[#f5f5f0]" />;
                                    }

                                    if (!franja.disponible) {
                                        return (
                                            <td key={dia.fecha} className="border border-[#E8E6DF] bg-[#f0f0eb] p-2 text-center text-xs text-[#9c9a92]">
                                                Fuera de horario
                                            </td>
                                        );
                                    }

                                    if (franja.cita) {
                                        const cancelada = franja.cita.cancelada;
                                        return (
                                            <td
                                                key={dia.fecha}
                                                onClick={() => !cancelada && setCitaSeleccionada(franja.cita)}
                                                className={`border border-[#E8E6DF] p-2 text-center text-xs ${
                                                    cancelada
                                                        ? 'text-[#9c9a92] line-through'
                                                        : 'cursor-pointer bg-[#EAF7DC] font-medium text-black hover:bg-[#EAF7DC]/70'
                                                }`}
                                            >
                                                {franja.cita.cliente.user.nombre}
                                                {cancelada && ' (cancelada)'}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={dia.fecha}
                                            onClick={() => setFranjaSeleccionada({ fecha: dia.fecha, hora })}
                                            className="cursor-pointer border border-[#E8E6DF] p-2 text-center text-xs text-[#3D3D3A] hover:bg-[#7ED321]/10"
                                        >
                                            +
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {franjaSeleccionada && (
                <ModalAgendar
                    fecha={franjaSeleccionada.fecha}
                    hora={franjaSeleccionada.hora}
                    clientes={clientes}
                    onClose={() => setFranjaSeleccionada(null)}
                />
            )}

            {citaSeleccionada && (
                <ModalGestionarCita
                    cita={citaSeleccionada}
                    onClose={() => setCitaSeleccionada(null)}
                />
            )}
        </div>
    );
}

function ModalAgendar({
    fecha,
    hora,
    clientes,
    onClose,
}: {
    fecha: string;
    hora: string;
    clientes: Cliente[];
    onClose: () => void;
}) {
    const [state, formAction, isPending] = useActionState(agendarAction, {});
    const [h, m] = hora.split(':').map(Number);
    const fechaHoraInicio = new Date(fecha);
    fechaHoraInicio.setHours(h, m, 0, 0);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-md bg-white p-6">
                <h3 className="mb-4 font-semibold text-black">
                    Agendar — {new Date(fecha).toLocaleDateString()} {hora}
                </h3>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="fechaInicio" value={fechaHoraInicio.toISOString()} />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#3D3D3A]">Cliente</label>
                        <select name="clienteId" required className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black">
                            <option value="">Selecciona…</option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>{c.user.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#3D3D3A]">Observaciones (opcional)</label>
                        <textarea name="observaciones" className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black" />
                    </div>

                    {state.error && <p className="text-sm text-red-600">{state.error}</p>}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-md border border-[#E8E6DF] py-2 text-sm font-medium text-black"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isPending ? 'Agendando…' : 'Agendar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ModalGestionarCita({ cita, onClose }: { cita: Cita; onClose: () => void }) {
    const [stateReagendar, formActionReagendar, isPendingReagendar] = useActionState(reagendarAction, {});
    const [stateCancelar, formActionCancelar, isPendingCancelar] = useActionState(cancelarAction, {});

    useEffect(() => {
        if (stateReagendar.success || stateCancelar.success) {
            onClose();
        }
    }, [stateReagendar.success, stateCancelar.success, onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-md bg-white p-6">
                <h3 className="mb-4 font-semibold text-black">{cita.cliente.user.nombre}</h3>

                <form action={formActionReagendar} className="space-y-4 border-b border-[#E8E6DF] pb-4">
                    <input type="hidden" name="citaId" value={cita.id} />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#3D3D3A]">Nueva fecha y hora</label>
                        <input
                            type="datetime-local"
                            name="fechaInicio"
                            required
                            className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black"
                        />
                    </div>
                    {stateReagendar.error && <p className="text-sm text-red-600">{stateReagendar.error}</p>}
                    <button
                        type="submit"
                        disabled={isPendingReagendar}
                        className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {isPendingReagendar ? 'Reagendando…' : 'Reagendar'}
                    </button>
                </form>

                <form action={formActionCancelar} className="mt-4 space-y-2">
                    <input type="hidden" name="citaId" value={cita.id} />
                    {stateCancelar.error && <p className="text-sm text-red-600">{stateCancelar.error}</p>}
                    <button
                        type="submit"
                        disabled={isPendingCancelar}
                        className="w-full rounded-md border border-red-600 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                        {isPendingCancelar ? 'Cancelando…' : 'Cancelar cita'}
                    </button>
                </form>

                <a 
                    href={`/valoraciones?clienteId=${cita.clienteId}&citaAgendaId=${cita.id}`}
                    className="mt-4 block w-full rounded-md bg-[#7ED321] py-2 text-center text-sm font-semibold text-black"
                >
                    Registrar valoración
                </a>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 w-full text-sm text-[#3D3D3A]"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
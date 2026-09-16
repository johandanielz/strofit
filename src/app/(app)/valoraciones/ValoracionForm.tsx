'use client';

import { useActionState, useState, useEffect } from 'react';
import { registrarValoracionAction, RegistrarValoracionActionState, obtenerAlturaSugerida } from './actions';

const initialState: RegistrarValoracionActionState = {};

interface Cliente {
    id: string;
    user: { nombre: string };
}

const inputClass =
    'w-full rounded-md border border-[#E8E6DF] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7ED321]';
const labelClass = 'text-sm font-medium text-[#3D3D3A]';

function obtenerFechaLocalHoy(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

export function ValoracionForm({
    clientes,
    clienteIdPreseleccionado,
    citaAgendaId,
}: {
    clientes: Cliente[];
    clienteIdPreseleccionado?: string;
    citaAgendaId?: string;
}) {
    const [state, formAction, isPending] = useActionState(registrarValoracionAction, initialState);
    const [alturaSugerida, setAlturaSugerida] = useState<number | null>(null);

    useEffect(() => {
        if (clienteIdPreseleccionado) {
            handleClienteChange(clienteIdPreseleccionado);
        }
    }, [clienteIdPreseleccionado]);

    async function handleClienteChange(clienteId: string) {
        if (!clienteId) {
            setAlturaSugerida(null);
            return;
        }
        const altura = await obtenerAlturaSugerida(clienteId);
        setAlturaSugerida(altura);
    }

    return (
        <form action={formAction} className="max-w-2xl space-y-8">
            {citaAgendaId && <input type="hidden" name="citaAgendaId" value={citaAgendaId} />}
            {/* --- Datos generales --- */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-black">Datos generales</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="clienteId" className={labelClass}>Cliente</label>
                        <select
                            id="clienteId"
                            name="clienteId"
                            required
                            defaultValue={clienteIdPreseleccionado ?? ''}
                            onChange={(e) => handleClienteChange(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Selecciona…</option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>{c.user.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="fecha" className={labelClass}>Fecha de la valoración</label>
                        <input
                            id="fecha"
                            name="fecha"
                            type="date"
                            required
                            defaultValue={obtenerFechaLocalHoy()}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="peso" className={labelClass}>Peso (kg)</label>
                        <input id="peso" name="peso" type="number" step="0.01" required className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="altura" className={labelClass}>
                            Altura (m) {alturaSugerida && <span className="text-xs text-[#3D3D3A]">(sugerida de la valoración anterior)</span>}
                        </label>
                        <input
                            id="altura"
                            name="altura"
                            type="number"
                            step="0.01"
                            defaultValue={alturaSugerida ?? undefined}
                            key={alturaSugerida}
                            className={inputClass}
                        />
                    </div>
                </div>
            </section>

            {/* --- Pliegues (mm) --- */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-black">Pliegues (mm)</h2>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        ['pliegueEctoral', 'Pectoral'],
                        ['pliegueAxial', 'Axilar medio'],
                        ['pliegueTricipital', 'Tríceps'],
                        ['pliegueEscapular', 'Subescapular'],
                        ['pliegueBicipital', 'Bicipital'],
                        ['pliegueAbdominal', 'Abdominal'],
                        ['pliegueSuprailico', 'Suprailiaco'],
                        ['pliegueEnPierna', 'Muslo'],
                        ['pliegueEnPantorrilla', 'Pantorrilla'],
                    ].map(([name, label]) => (
                        <div key={name} className="space-y-1.5">
                            <label htmlFor={name} className={labelClass}>{label}</label>
                            <input id={name} name={name} type="number" step="0.1" required className={inputClass} />
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Medidas (cm) --- */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-black">Medidas (cm)</h2>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        ['cuello', 'Cuello'],
                        ['brazoIzquierdo', 'Brazo izquierdo'],
                        ['brazoDerecho', 'Brazo derecho'],
                        ['hombros', 'Hombros'],
                        ['pecho', 'Pecho'],
                        ['antebrazoIzquierdo', 'Antebrazo izquierdo'],
                        ['antebrazoDerecho', 'Antebrazo derecho'],
                        ['cintura', 'Cintura'],
                        ['abdomen', 'Abdomen'],
                        ['absBajo', 'Abs bajo'],
                        ['cadera', 'Cadera'],
                        ['piernaAltaIzquierda', 'Pierna alta izquierda'],
                        ['piernaAltaDerecha', 'Pierna alta derecha'],
                        ['piernaIzquierda', 'Pierna izquierda'],
                        ['piernaDerecha', 'Pierna derecha'],
                        ['piernaBajaIzquierda', 'Pierna baja izquierda'],
                        ['piernaBajaDerecha', 'Pierna baja derecha'],
                        ['pantorrillaIzquierda', 'Pantorrilla izquierda'],
                        ['pantorrillaDerecha', 'Pantorrilla derecha'],
                    ].map(([name, label]) => (
                        <div key={name} className="space-y-1.5">
                            <label htmlFor={name} className={labelClass}>{label}</label>
                            <input id={name} name={name} type="number" step="0.1" required className={inputClass} />
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Punto crítico (opcional) --- */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-black">Punto crítico (opcional)</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="puntoCriticoNombre" className={labelClass}>Nombre del punto</label>
                        <input id="puntoCriticoNombre" name="puntoCriticoNombre" type="text" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="puntoCriticoMedida" className={labelClass}>Medida</label>
                        <input id="puntoCriticoMedida" name="puntoCriticoMedida" type="number" step="0.1" className={inputClass} />
                    </div>
                </div>
            </section>

            {state.error && (
                <p className="text-sm text-red-600" role="alert">{state.error}</p>
            )}
            {state.success && (
                <p className="text-sm text-green-700" role="status">Valoración registrada correctamente</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {isPending ? 'Guardando…' : 'Registrar valoración'}
            </button>
        </form>
    );
}
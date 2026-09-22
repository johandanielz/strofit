// src/app/(app)/entrenamiento/sesion/[sesionId]/EjercicioForm.tsx
'use client';

import { useActionState } from 'react';
import { crearEjercicioAction } from './actions';

interface EjercicioBiblioteca {
    id: string;
    nombre: string;
    categoria: { nombre: string };
}

const inputClass = 'w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black';

export function EjercicioForm({
    sesionId,
    catalogo,
}: {
    sesionId: string;
    catalogo: EjercicioBiblioteca[];
}) {
    const [state, formAction, isPending] = useActionState(crearEjercicioAction, {});

    return (
        <form action={formAction} className="max-w-md space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="sesionId" value={sesionId} />

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Ejercicio</label>
                <select name="bibliotecaId" required className={inputClass}>
                    <option value="">Selecciona…</option>
                    {catalogo.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.categoria.nombre} — {e.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-[#3D3D3A]">Orden</label>
                    <input type="number" name="orden" required min={1} className={inputClass} />
                </div>
                <div>
                    <label className="text-sm font-medium text-[#3D3D3A]">Series</label>
                    <input type="number" name="numeroSeries" required min={1} className={inputClass} />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Repeticiones sugeridas</label>
                <input name="repeticionesSugeridas" placeholder="Ej: 8-10, MAX, 12-15 + DROPS" required className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-[#3D3D3A]">Descanso (segundos)</label>
                    <input type="number" name="descansoSegundos" required min={0} className={inputClass} />
                </div>
                <div>
                    <label className="text-sm font-medium text-[#3D3D3A]">RIR (opcional)</label>
                    <input name="rir" placeholder="Ej: 1-0" className={inputClass} />
                </div>
            </div>

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Agregando…' : 'Agregar ejercicio'}
            </button>
        </form>
    );
}
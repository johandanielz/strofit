// src/app/(app)/entrenamiento/sesion/[sesionId]/EjercicioForm.tsx
'use client';

import { useActionState, useState } from 'react';
import { crearEjercicioAction } from './actions';
import { ComboboxFiltrable } from '@/components/ComboboxFiltrable';

interface EjercicioBiblioteca {
    id: string;
    nombre: string;
    categoriaId: string;
    categoria: { id: string; nombre: string };
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
    const [categoriaId, setCategoriaId] = useState('');

    const categorias = Array.from(
        new Map(catalogo.map((e) => [e.categoria.id, e.categoria])).values()
    ).map((c) => ({ id: c.id, etiqueta: c.nombre }));

    const ejerciciosFiltrados = catalogo
        .filter((e) => !categoriaId || e.categoriaId === categoriaId)
        .map((e) => ({ id: e.id, etiqueta: e.nombre }));

    return (
        <form action={formAction} className="max-w-md space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="sesionId" value={sesionId} />

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Categoría</label>
                <ComboboxFiltrable
                    name="categoriaFiltro"
                    opciones={categorias}
                    placeholder="Escribe para buscar…"
                    onSeleccion={setCategoriaId}
                />
            </div>

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Ejercicio</label>
                <ComboboxFiltrable
                    name="bibliotecaId"
                    opciones={ejerciciosFiltrados}
                    placeholder={categoriaId ? 'Escribe para buscar…' : 'Selecciona una categoría primero'}
                />
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
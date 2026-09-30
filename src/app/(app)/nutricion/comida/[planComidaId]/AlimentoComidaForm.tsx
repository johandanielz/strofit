// src/app/(app)/nutricion/comida/[planComidaId]/AlimentoComidaForm.tsx
'use client';

import { useActionState } from 'react';
import { crearAlimentoComidaAction } from './actions';
import { ComboboxFiltrable } from '@/components/ComboboxFiltrable';

interface AlimentoBiblioteca {
    id: string;
    nombre: string;
    gramosReferencia: number;
    equivalencia: string | null;
}

const inputClass = 'w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black';

export function AlimentoComidaForm({
    planComidaId,
    catalogo,
}: {
    planComidaId: string;
    catalogo: AlimentoBiblioteca[];
}) {
    const [state, formAction, isPending] = useActionState(crearAlimentoComidaAction, {});

    const opciones = catalogo.map((a) => ({
        id: a.id,
        etiqueta: `${a.nombre} (${a.gramosReferencia}g${a.equivalencia ? ` / ${a.equivalencia}` : ''})`,
    }));

    return (
        <form action={formAction} className="max-w-md space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="planComidaId" value={planComidaId} />

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Alimento</label>
                <ComboboxFiltrable
                    name="alimentoBibliotecaId"
                    opciones={opciones}
                    placeholder="Escribe para buscar…"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-[#3D3D3A]">Gramos</label>
                    <input type="number" name="gramos" step="0.1" required min={0.1} className={inputClass} />
                </div>
                <div>
                    <label className="text-sm font-medium text-[#3D3D3A]">Orden</label>
                    <input type="number" name="orden" required min={1} className={inputClass} />
                </div>
            </div>

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Agregando…' : 'Agregar alimento'}
            </button>
        </form>
    );
}
// src/app/(app)/nutricion/[clienteId]/MetaNutricionalForm.tsx
'use client';

import { useActionState } from 'react';
import { crearMetaNutricionalAction } from './actions';

const inputClass = 'w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black';

export function MetaNutricionalForm({ clienteId }: { clienteId: string }) {
    const [state, formAction, isPending] = useActionState(crearMetaNutricionalAction, {});

    return (
        <form action={formAction} className="space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="clienteId" value={clienteId} />

            <label className="text-sm font-medium text-[#3D3D3A]">% Grasa objetivo</label>
            <input
                name="porcentajeGrasaObjetivo"
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                className={inputClass}
            />

            <label className="text-sm font-medium text-[#3D3D3A]">Pérdida de grasa semanal (g)</label>
            <input
                name="perdidaGrasaSemanalGramos"
                type="number"
                step="1"
                min="0"
                required
                className={inputClass}
            />

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Guardando…' : 'Establecer meta'}
            </button>
        </form>
    );
}
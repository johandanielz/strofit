// src/app/(app)/entrenamiento/[clienteId]/MacrocicloForm.tsx
'use client';

import { useActionState } from 'react';
import { crearMacrocicloAction } from './actions';

export function MacrocicloForm({ clienteId }: { clienteId: string }) {
    const [state, formAction, isPending] = useActionState(crearMacrocicloAction, {});

    return (
        <form action={formAction} className="max-w-sm space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="clienteId" value={clienteId} />
            <label className="text-sm font-medium text-[#3D3D3A]">Fecha de inicio del macrociclo</label>
            <input
                type="date"
                name="fechaInicio"
                required
                className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black"
            />
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Creando…' : 'Crear macrociclo'}
            </button>
        </form>
    );
}
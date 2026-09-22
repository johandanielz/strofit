// src/app/(app)/entrenamiento/macrociclo/[macrocicloId]/MicrocicloForm.tsx
'use client';

import { useActionState } from 'react';
import { crearMicrocicloAction } from './actions';

export function MicrocicloForm({ macrocicloId }: { macrocicloId: string }) {
    const [state, formAction, isPending] = useActionState(crearMicrocicloAction, {});

    return (
        <form action={formAction} className="max-w-sm space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="macrocicloId" value={macrocicloId} />
            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Número</label>
                <input type="number" name="numero" required min={1} className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black" />
            </div>
            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Fecha de inicio</label>
                <input type="date" name="fechaInicio" required className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black" />
            </div>
            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Fecha de fin</label>
                <input type="date" name="fechaFin" required className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black" />
            </div>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Creando…' : 'Crear microciclo'}
            </button>
        </form>
    );
}
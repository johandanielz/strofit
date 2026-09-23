// src/app/(app)/entrenamiento/microciclo/[microcicloId]/SesionForm.tsx
'use client';

import { useActionState } from 'react';
import { crearSesionAction } from './actions';

export function SesionForm({ microcicloId }: { microcicloId: string }) {
    const [state, formAction, isPending] = useActionState(crearSesionAction, {});

    return (
        <form action={formAction} className="max-w-sm space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="microcicloId" value={microcicloId} />
            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Número</label>
                <input type="number" name="numero" required min={1} className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black" />
            </div>
            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Fecha</label>
                <input type="date" name="fecha" required className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black" />
            </div>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Creando…' : 'Crear sesión'}
            </button>
        </form>
    );
}
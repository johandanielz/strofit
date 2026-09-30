// src/app/(app)/nutricion/plan/[planNutricionalId]/PlanComidaForm.tsx
'use client';

import { useActionState } from 'react';
import { crearPlanComidaAction } from './actions';

const inputClass = 'w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black';

export function PlanComidaForm({ planNutricionalId }: { planNutricionalId: string }) {
    const [state, formAction, isPending] = useActionState(crearPlanComidaAction, {});

    return (
        <form action={formAction} className="max-w-sm space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="planNutricionalId" value={planNutricionalId} />

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Tipo de comida</label>
                <select name="tipo" required className={inputClass}>
                    <option value="DESAYUNO">Desayuno</option>
                    <option value="MEDIA_MANANA">Media mañana</option>
                    <option value="ALMUERZO">Almuerzo</option>
                    <option value="MERIENDA">Merienda</option>
                    <option value="POST_ENTRENO">Post-entreno</option>
                    <option value="COMIDA">Comida</option>
                </select>
            </div>

            <div>
                <label className="text-sm font-medium text-[#3D3D3A]">Orden</label>
                <input type="number" name="orden" required min={1} className={inputClass} />
            </div>

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Agregando…' : 'Agregar comida'}
            </button>
        </form>
    );
}
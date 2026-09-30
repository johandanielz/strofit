// src/app/(app)/nutricion/[clienteId]/PlanNutricionalForm.tsx
'use client';

import { useActionState, useState } from 'react';
import { crearPlanNutricionalAction } from './actions';

interface ValoracionOption {
    id: string;
    label: string;
}

const inputClass = 'w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black';

export function PlanNutricionalForm({
    clienteId,
    valoraciones,
}: {
    clienteId: string;
    valoraciones: ValoracionOption[];
}) {
    const [state, formAction, isPending] = useActionState(crearPlanNutricionalAction, {});
    const [objetivo, setObjetivo] = useState('DEFICIT');

    return (
        <form action={formAction} className="space-y-3 rounded-md border border-[#E8E6DF] bg-white p-4">
            <input type="hidden" name="clienteId" value={clienteId} />

            <label className="text-sm font-medium text-[#3D3D3A]">Valoración base</label>
            <select name="valoracionId" required className={inputClass}>
                {valoraciones.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.label}
                    </option>
                ))}
            </select>

            <label className="text-sm font-medium text-[#3D3D3A]">Objetivo</label>
            <select
                name="objetivo"
                required
                className={inputClass}
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
            >
                <option value="DEFICIT">Déficit</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="SUPERAVIT">Superávit</option>
            </select>

            {objetivo !== 'MANTENIMIENTO' && (
                <>
                    <label className="text-sm font-medium text-[#3D3D3A]">
                        Tasa semanal de cambio de peso (% del peso corporal)
                    </label>
                    <input
                        name="tasaSemanalPeso"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className={inputClass}
                    />
                </>
            )}

            <label className="text-sm font-medium text-[#3D3D3A]">
                Proteína (g por kg de masa libre de grasa)
            </label>
            <input name="proteinaGramosPorKgLBM" type="number" step="0.1" min="0" required className={inputClass} />

            <label className="text-sm font-medium text-[#3D3D3A]">Agua (litros, opcional)</label>
            <input name="aguaLitros" type="number" step="0.1" min="0" className={inputClass} />

            <label className="text-sm font-medium text-[#3D3D3A]">Pasos objetivo (opcional)</label>
            <input name="pasosObjetivo" type="number" step="1" min="0" className={inputClass} />

            <label className="text-sm font-medium text-[#3D3D3A]">Cardio semanal (minutos, opcional)</label>
            <input name="cardioMinutosSemanal" type="number" step="1" min="0" className={inputClass} />

            <label className="text-sm font-medium text-[#3D3D3A]">Notas (opcional)</label>
            <textarea name="notas" rows={2} className={inputClass} />

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
                {isPending ? 'Creando…' : 'Crear plan'}
            </button>
        </form>
    );
}
// src/app/(app)/nutricion/plan/[planNutricionalId]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { PlanComidaForm } from './PlanComidaForm';

const ETIQUETAS_TIPO_COMIDA: Record<string, string> = {
    DESAYUNO: 'Desayuno',
    MEDIA_MANANA: 'Media mañana',
    ALMUERZO: 'Almuerzo',
    MERIENDA: 'Merienda',
    POST_ENTRENO: 'Post-entreno',
    COMIDA: 'Comida',
};

const ETIQUETAS_OBJETIVO: Record<string, string> = {
    DEFICIT: 'Déficit',
    MANTENIMIENTO: 'Mantenimiento',
    SUPERAVIT: 'Superávit',
};

export default async function PlanComidasPage({
    params,
}: {
    params: Promise<{ planNutricionalId: string }>;
}) {
    const { planNutricionalId } = await params;
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    const plan = await prisma.planNutricional.findUnique({
        where: { id: planNutricionalId },
        select: { clienteId: true, objetivo: true },
    });

    if (!plan) {
        notFound();
    }

    try {
        await assertClienteDelEntrenador(plan.clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) {
            notFound();
        }
        throw e;
    }

    const comidas = await prisma.planComida.findMany({
        where: { planNutricionalId, deletedAt: null },
        orderBy: { orden: 'asc' },
    });

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">
                Comidas del plan — {ETIQUETAS_OBJETIVO[plan.objetivo] ?? plan.objetivo}
            </h1>

            <PlanComidaForm planNutricionalId={planNutricionalId} />

            <div className="mt-8 space-y-2">
                {comidas.map((c) => (
                    <Link
                        key={c.id}
                        href={`/nutricion/comida/${c.id}`}
                        className="block rounded-md border border-[#E8E6DF] bg-white px-4 py-3 font-medium text-black hover:bg-[#f5f5f0]"
                    >
                        {c.orden}. {ETIQUETAS_TIPO_COMIDA[c.tipo] ?? c.tipo}
                    </Link>
                ))}
                {comidas.length === 0 && (
                    <p className="text-sm text-[#3D3D3A]">Este plan todavía no tiene comidas.</p>
                )}
            </div>
        </div>
    );
}
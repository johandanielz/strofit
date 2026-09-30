// src/app/(app)/nutricion/comida/[planComidaId]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { AlimentoComidaForm } from './AlimentoComidaForm';

const ETIQUETAS_TIPO_COMIDA: Record<string, string> = {
    DESAYUNO: 'Desayuno',
    MEDIA_MANANA: 'Media mañana',
    ALMUERZO: 'Almuerzo',
    MERIENDA: 'Merienda',
    POST_ENTRENO: 'Post-entreno',
    COMIDA: 'Comida',
};

export default async function AlimentosComidaPage({
    params,
}: {
    params: Promise<{ planComidaId: string }>;
}) {
    const { planComidaId } = await params;
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    const comida = await prisma.planComida.findUnique({
        where: { id: planComidaId },
        select: { tipo: true, planNutricional: { select: { clienteId: true } } },
    });

    if (!comida) {
        notFound();
    }

    try {
        await assertClienteDelEntrenador(comida.planNutricional.clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) {
            notFound();
        }
        throw e;
    }

    const [alimentos, catalogo] = await Promise.all([
        prisma.alimentoComida.findMany({
            where: { planComidaId, deletedAt: null },
            orderBy: { orden: 'asc' },
            include: { alimentoBiblioteca: true },
        }),
        prisma.alimentoBiblioteca.findMany({
            where: { entrenadorId, deletedAt: null },
            orderBy: { nombre: 'asc' },
        }),
    ]);

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">
                Alimentos — {ETIQUETAS_TIPO_COMIDA[comida.tipo] ?? comida.tipo}
            </h1>

            <AlimentoComidaForm planComidaId={planComidaId} catalogo={catalogo} />

            <div className="mt-8 space-y-2">
                {alimentos.map((a) => {
                    const factor = a.gramos / a.alimentoBiblioteca.gramosReferencia;
                    const proteina = a.alimentoBiblioteca.proteinaGramos * factor;
                    const carbohidratos = a.alimentoBiblioteca.carbohidratosGramos * factor;
                    const grasa = a.alimentoBiblioteca.grasaGramos * factor;

                    return (
                        <div key={a.id} className="rounded-md border border-[#E8E6DF] bg-white p-4">
                            <p className="font-semibold text-black">
                                {a.orden}. {a.alimentoBiblioteca.nombre} — {a.gramos} g
                            </p>
                            <p className="text-sm text-[#3D3D3A]">
                                P: {proteina.toFixed(1)}g, C: {carbohidratos.toFixed(1)}g, G: {grasa.toFixed(1)}g
                            </p>
                        </div>
                    );
                })}
                {alimentos.length === 0 && (
                    <p className="text-sm text-[#3D3D3A]">Esta comida todavía no tiene alimentos.</p>
                )}
            </div>
        </div>
    );
}
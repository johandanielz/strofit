// src/app/(app)/nutricion/[clienteId]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { assertClienteDelEntrenador, prismaGuardsRepository, AccesoNoAutorizadoError } from '@/lib/auth/guards';
import { obtenerEntrenadorIdDeLaSesion } from '@/lib/auth/getEntrenadorId';
import { formatearFechaUTC } from '@/lib/formatearFechaUTC';
import { MetaNutricionalForm } from './MetaNutricionalForm';
import { PlanNutricionalForm } from './PlanNutricionalForm';

export default async function NutricionClientePage({
    params,
}: {
    params: Promise<{ clienteId: string }>;
}) {
    const { clienteId } = await params;
    const entrenadorId = await obtenerEntrenadorIdDeLaSesion();

    try {
        await assertClienteDelEntrenador(clienteId, entrenadorId, prismaGuardsRepository);
    } catch (e) {
        if (e instanceof AccesoNoAutorizadoError) {
            notFound();
        }
        throw e;
    }

    const [cliente, valoraciones, metaActiva, planes] = await Promise.all([
        prisma.cliente.findUnique({
            where: { id: clienteId },
            select: { user: { select: { nombre: true } } },
        }),
        prisma.valoracion.findMany({
            where: { clienteId, deletedAt: null },
            orderBy: { fecha: 'desc' },
            select: { id: true, fecha: true, peso: true },
        }),
        prisma.metaNutricional.findFirst({
            where: { clienteId, activa: true, deletedAt: null },
        }),
        prisma.planNutricional.findMany({
            where: { clienteId, deletedAt: null },
            orderBy: { id: 'desc' },
            include: { valoracion: { select: { fecha: true } } },
        }),
    ]);

    const opcionesValoraciones = valoraciones.map((v) => ({
        id: v.id,
        label: `${formatearFechaUTC(v.fecha)} — ${v.peso} kg`,
    }));

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">
                Nutrición — {cliente?.user.nombre}
            </h1>

            <div className="grid gap-8 md:grid-cols-2">
                <section>
                    <h2 className="mb-3 font-semibold text-black">Meta nutricional</h2>
                    {metaActiva ? (
                        <div className="mb-4 rounded-md border border-[#E8E6DF] bg-white p-4 text-sm text-[#3D3D3A]">
                            <p>Peso inicial: {metaActiva.pesoInicial} kg</p>
                            <p>% Grasa inicial: {metaActiva.porcentajeGrasaInicial.toFixed(2)}%</p>
                            <p>% Grasa objetivo: {metaActiva.porcentajeGrasaObjetivo.toFixed(2)}%</p>
                            <p>Pérdida semanal: {metaActiva.perdidaGrasaSemanalGramos} g</p>
                        </div>
                    ) : (
                        <p className="mb-4 text-sm text-[#3D3D3A]">
                            Este cliente todavía no tiene una meta activa.
                        </p>
                    )}
                    <MetaNutricionalForm clienteId={clienteId} />
                </section>

                <section>
                    <h2 className="mb-3 font-semibold text-black">Plan nutricional</h2>
                    {opcionesValoraciones.length === 0 ? (
                        <p className="text-sm text-[#3D3D3A]">
                            Este cliente todavía no tiene valoraciones registradas. Se necesita al menos una para crear un plan.
                        </p>
                    ) : (
                        <PlanNutricionalForm clienteId={clienteId} valoraciones={opcionesValoraciones} />
                    )}

                    <div className="mt-6 space-y-2">
                        {planes.map((p) => (
                            <Link
                                key={p.id}
                                href={`/nutricion/plan/${p.id}`}
                                className="block rounded-md border border-[#E8E6DF] bg-white px-4 py-3 font-medium text-black hover:bg-[#f5f5f0]"
                            >
                                Plan {p.objetivo} — valoración del {formatearFechaUTC(p.valoracion.fecha)}
                            </Link>
                        ))}
                        {planes.length === 0 && (
                            <p className="text-sm text-[#3D3D3A]">Este cliente todavía no tiene planes nutricionales.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
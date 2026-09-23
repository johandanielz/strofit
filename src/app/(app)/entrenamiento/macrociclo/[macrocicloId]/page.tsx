// src/app/(app)/entrenamiento/macrociclo/[macrocicloId]/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { MicrocicloForm } from './MicrocicloForm';
import { formatearFechaUTC } from '@/lib/formatearFechaUTC';

export default async function MicrociclosPage({
    params,
}: {
    params: Promise<{ macrocicloId: string }>;
}) {
    const { macrocicloId } = await params;

    const microciclos = await prisma.microciclo.findMany({
        where: { macrocicloId, deletedAt: null },
        orderBy: { numero: 'asc' },
    });

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Microciclos</h1>

            <MicrocicloForm macrocicloId={macrocicloId} />

            <div className="mt-8 space-y-2">
                {microciclos.map((m) => (
                    <Link
                        key={m.id}
                        href={`/entrenamiento/microciclo/${m.id}`}
                        className="block rounded-md border border-[#E8E6DF] bg-white px-4 py-3 font-medium text-black hover:bg-[#f5f5f0]"
                    >
                        Microciclo {m.numero} — {formatearFechaUTC(m.fechaInicio)} a {formatearFechaUTC(m.fechaFin)}
                    </Link>
                ))}
                {microciclos.length === 0 && (
                    <p className="text-sm text-[#3D3D3A]">Este macrociclo todavía no tiene microciclos.</p>
                )}
            </div>
        </div>
    );
}
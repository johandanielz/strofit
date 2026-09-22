// src/app/(app)/entrenamiento/[clienteId]/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { MacrocicloForm } from './MacrocicloForm';

export default async function MacrociclosPage({
    params,
}: {
    params: Promise<{ clienteId: string }>;
}) {
    const { clienteId } = await params;

    const [cliente, macrociclos] = await Promise.all([
        prisma.cliente.findUnique({
            where: { id: clienteId },
            select: { user: { select: { nombre: true } } },
        }),
        prisma.macrociclo.findMany({
            where: { clienteId, deletedAt: null },
            orderBy: { fechaInicio: 'desc' },
        }),
    ]);

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">
                Entrenamiento — {cliente?.user.nombre}
            </h1>

            <MacrocicloForm clienteId={clienteId} />

            <div className="mt-8 space-y-2">
                {macrociclos.map((m) => (
                    <Link
                        key={m.id}
                        href={`/entrenamiento/macrociclo/${m.id}`}
                        className="block rounded-md border border-[#E8E6DF] bg-white px-4 py-3 font-medium text-black hover:bg-[#f5f5f0]"
                    >
                        Macrociclo desde {m.fechaInicio.toLocaleDateString()}
                    </Link>
                ))}
                {macrociclos.length === 0 && (
                    <p className="text-sm text-[#3D3D3A]">Este cliente todavía no tiene macrociclos.</p>
                )}
            </div>
        </div>
    );
}
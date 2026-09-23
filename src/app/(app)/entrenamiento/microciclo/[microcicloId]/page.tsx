// src/app/(app)/entrenamiento/microciclo/[microcicloId]/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SesionForm } from './SesionForm';
import { formatearFechaUTC } from '@/lib/formatearFechaUTC';

export default async function SesionesPage({
    params,
}: {
    params: Promise<{ microcicloId: string }>;
}) {
    const { microcicloId } = await params;

    const sesiones = await prisma.sesionEntrenamiento.findMany({
        where: { microcicloId, deletedAt: null },
        orderBy: { numero: 'asc' },
    });

    return (
        <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-black">Sesiones</h1>

            <SesionForm microcicloId={microcicloId} />

            <div className="mt-8 space-y-2">
                {sesiones.map((s) => (
                    <Link
                        key={s.id}
                        href={`/entrenamiento/sesion/${s.id}`}
                        className="block rounded-md border border-[#E8E6DF] bg-white px-4 py-3 font-medium text-black hover:bg-[#f5f5f0]"
                    >
                        Sesión {s.numero} — {formatearFechaUTC(s.fecha)}
                    </Link>
                ))}
                {sesiones.length === 0 && (
                    <p className="text-sm text-[#3D3D3A]">Este microciclo todavía no tiene sesiones.</p>
                )}
            </div>
        </div>
    );
}
// src/app/(app)/valoraciones/[valoracionId]/fotos/page.tsx
import { FotosForm } from './FotosForm';

export default async function FotosPage({
    params,
}: {
    params: Promise<{ valoracionId: string }>;
}) {
    const { valoracionId } = await params;

    return (
        <div className="p-8">
            <h1 className="mb-2 text-2xl font-bold text-black">Fotos de la valoración</h1>
            <p className="mb-6 text-sm text-[#3D3D3A]">
                Sube las fotos de los 4 ángulos, o continúa sin ellas si lo prefieres.
            </p>
            <FotosForm valoracionId={valoracionId} />
        </div>
    );
}
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAF7] p-8 text-center">
            <h1 className="text-4xl font-bold text-black">404</h1>
            <p className="text-[#3D3D3A]">La página que buscas no existe o no tienes acceso a ella.</p>
            <Link
                href="/clientes/lista"
                className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
                Volver a mis clientes
            </Link>
        </div>
    );
}
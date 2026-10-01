import Link from 'next/link';

const ENLACES = [
    { href: '/dashboard', etiqueta: 'Dashboard' },
    { href: '/agenda', etiqueta: 'Agenda' },
    { href: '/clientes/lista', etiqueta: 'Clientes' },
    { href: '/valoraciones', etiqueta: 'Valoraciones' },
    { href: '/entrenamiento/catalogo', etiqueta: 'Entrenamiento' },
    { href: '/nutricion/catalogo', etiqueta: 'Nutrición' },
];

export function NavMenu() {
    return (
        <nav className="flex flex-col gap-1">
            {ENLACES.map((enlace) => (
                <Link
                    key={enlace.href}
                    href={enlace.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
                >
                    {enlace.etiqueta}
                </Link>
            ))}
        </nav>
    );
}
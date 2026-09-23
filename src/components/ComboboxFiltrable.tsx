'use client';

import { useState, useRef, useEffect } from 'react';

interface Opcion {
    id: string;
    etiqueta: string;
}

export function ComboboxFiltrable({
    name,
    opciones,
    placeholder,
    onSeleccion,
}: {
    name: string;
    opciones: Opcion[];
    placeholder: string;
    onSeleccion?: (id: string) => void;
}) {
    const [texto, setTexto] = useState('');
    const [valorSeleccionado, setValorSeleccionado] = useState('');
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef<HTMLDivElement>(null);

    const filtradas = opciones.filter((o) =>
        o.etiqueta.toLowerCase().includes(texto.toLowerCase())
    );

    useEffect(() => {
        function handleClickFuera(e: MouseEvent) {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
                setAbierto(false);
            }
        }
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    function seleccionar(opcion: Opcion) {
        setTexto(opcion.etiqueta);
        setValorSeleccionado(opcion.id);
        setAbierto(false);
        onSeleccion?.(opcion.id);
    }

    return (
        <div ref={contenedorRef} className="relative">
            <input type="hidden" name={name} value={valorSeleccionado} />
            <input
                type="text"
                value={texto}
                placeholder={placeholder}
                onChange={(e) => {
                    setTexto(e.target.value);
                    setValorSeleccionado('');
                    setAbierto(true);
                }}
                onFocus={() => setAbierto(true)}
                className="w-full rounded-md border border-[#E8E6DF] px-3 py-2 text-black"
            />
            {abierto && filtradas.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-[#E8E6DF] bg-white shadow-md">
                    {filtradas.map((o) => (
                        <li
                            key={o.id}
                            onClick={() => seleccionar(o)}
                            className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-[#f5f5f0]"
                        >
                            {o.etiqueta}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
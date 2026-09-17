'use client';

import { createClient } from '../supabase/client';

const BUCKET = 'fotos-valoraciones';

export async function subirFotoValoracion(
    valoracionId: string,
    angulo: string,
    archivo: File
): Promise<{ ok: true; storagePath: string } | { ok: false; error: string }> {
    const supabase = createClient();

    const extension = archivo.name.split('.').pop();
    const rutaArchivo = `${valoracionId}/${angulo}.${extension}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(rutaArchivo, archivo, { upsert: true });

    if (error) {
        return { ok: false, error: error.message };
    }

    return { ok: true, storagePath: rutaArchivo };
}
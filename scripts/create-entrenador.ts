import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/lib/db';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
);

async function main() {
    const email = process.env.ENTRENADOR_EMAIL;
    const password = process.env.ENTRENADOR_PASSWORD;
    const nombre = process.env.ENTRENADOR_NOMBRE;

    if (!email || !password || !nombre) {
        console.error('Faltan variables: ENTRENADOR_EMAIL, ENTRENADOR_PASSWORD, ENTRENADOR_NOMBRE');
        process.exit(1);
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { rol: 'ENTRENADOR', nombre },
    });

    if (error) {
        console.error('Error creando usuario en Supabase Auth:', error);
        return;
    }

    const user = await prisma.user.create({
        data: {
            supabaseUserId: data.user.id,
            email: data.user.email!,
            nombre,
            rol: 'ENTRENADOR',
        },
    });

    await prisma.entrenador.create({
        data: { userId: user.id },
    });

    console.log('Entrenador creado en Supabase Auth y en Prisma:', user.id);
}

main();
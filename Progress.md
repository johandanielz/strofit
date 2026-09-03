# Progress — StroFit

> Seguimiento de implementación. Cada sección corresponde 1:1 a una historia de
> [`BackLog.md`](./BackLog.md). Se actualiza cada vez que se implementa o modifica una
> HU — si cambias el estado de una historia aquí, refleja el mismo cambio allá.
>
> **Modo de trabajo:** Johan escribe el código, Claude guía paso a paso (explica el
> porqué, no solo el qué, y revisa lo que Johan escribe antes de avanzar). Este
> archivo se llena a medida que avanzamos en la sesión, no de antemano.

## Resumen general

| Sprint | Módulo                        | HU totales | Implementadas | Pruebas | Cobertura |
|--------|--------------------------------|:---------:|:--------------:|:-------:|:---------:|
| 1      | Autenticación y arquitectura base | 5 (HU-21,22,01,02,03) | 2/5 | 5/5 ✅ | — |
| 2      | Valoraciones físicas            | 6 | 0/6 | — | — |
| 3      | Entrenamiento                   | 4 | 0/4 | — | — |
| 4      | Nutrición                       | 3 | 0/3 | — | — |
| 5      | Notificaciones                  | 4 | 0/4 | — | — |

**Última ejecución de la suite completa:** aún no hay suite — se crea en el primer
paso de la sesión de implementación.

---

## Plan para la sesión de hoy en la tarde (Sprint 1)

Orden sugerido, de menor a mayor dependencia — cada paso se marca aquí como
`Hecho`/`Pendiente` a medida que avanzamos:

1. ✅ **Setup del proyecto** — `create-next-app` (Next.js 16.3 + TypeScript + Tailwind),
   estructura de carpetas (`src/lib`, `src/app`, `prisma/`).
2. ✅ **Proyecto de Supabase** — crear el proyecto, obtener `DATABASE_URL` y las llaves
   de Auth, variables de entorno en `.env` (nunca committeadas).
3. ✅ **HU-21 — Prisma schema** — definir el modelo de datos completo y correr
   `npx prisma migrate dev` contra el Supabase real (esta vez sí, con base de datos
   viva, no solo el archivo declarativo). Migrado contra Supabase real, con soft deletes.
4. ⬜ **Docker + docker-compose** — entorno de desarrollo local reproducible.
5. ✅ **Jest configurado** — mismo setup que ya validamos ayer (ts-jest), pero dentro
   del proyecto Next.js real. ts-jest funcionando en el proyecto real.
6. ✅ **HU-22 — sincronización con Supabase Auth** — completa y verificada.
7. ⬜ **HU-02 — registro de cliente** — server action + validación + pruebas.
8. 🔶 **HU-01 / HU-03 — login compartido con redirect por rol** — server action +
   middleware de sesión + pruebas. En progreso
   (rama `feature/HU-01-login-entrenador`, ver detalle abajo).

Cada paso se documenta abajo con: qué se implementó, qué pruebas se escribieron,
qué criterios de aceptación quedaron validados y qué decisiones de diseño se
tomaron (para que quede como referencia de aprendizaje, no solo como changelog).

---

## Sprint 1 — Autenticación y arquitectura base

### HU-21 — Modelo de datos base

**Estado:** ✅ Implementado (parcial) — modelos `User`, `Entrenador`, `Cliente` migrados
contra Supabase. Faltan Valoraciones, Entrenamientos, Nutrición, Notificaciones.

**Decisión agregada (no estaba en el diseño original):** soft deletes obligatorios en
todo el sistema — cada modelo tendrá `deletedAt DateTime?`, las relaciones usan
`onDelete: Restrict` en vez de `Cascade`. Documentado como regla en `CLAUDE.md`.

**Deuda técnica conocida:** los `@unique` (`email`, `supabaseUserId`) no excluyen
filas con soft delete — un email "borrado" sigue bloqueando su reutilización. Se
resolvería con un índice único parcial (`WHERE deletedAt IS NULL`), no soportado
nativamente en el schema de Prisma; requeriría editar el SQL de la migración a mano.
No se resuelve en el MVP.

**Migración aplicada:** `20260901035441_init_user_entrenador_cliente`

### HU-22 — Sincronización de usuarios con Supabase Auth

**Estado:** ✅ Completado — implementado y verificado contra Supabase real (no solo
pruebas unitarias con repositorio falso).

**Archivos:**
- `src/lib/auth/syncUser.ts` — lógica de negocio (Repository pattern)
- `src/lib/auth/prismaUserSyncRepository.ts` — implementación real con Prisma
- `tests/user-sync.test.ts` — 5/5 pruebas unitarias

**Pruebas:** 5/5 ✅ — criterios 1, 2, 3, 5 y 6 (nuevo) cubiertos explícitamente.
Criterio 4 (fallo no permite continuar) cubierto por diseño, no por prueba explícita.

**Decisión de negocio agregada hoy (criterio 6, no estaba en el diseño original):**
una cuenta con `deletedAt` no nulo se reconoce pero **no se reactiva
automáticamente** al volver a iniciar sesión — devuelve `CUENTA_DESACTIVADA`. La
reactivación requeriría una acción explícita del entrenador (fuera de alcance de
HU-22).

**Verificación manual contra Supabase real:**
- ✅ Creación de usuario nuevo — confirmado en Table Editor.
- ✅ Detección de cuenta desactivada — confirmado editando `deletedAt` manualmente
  en Supabase y re-corriendo la sincronización.

**Nota de arquitectura importante:** HU-22 confirma que `User` (nuestra tabla) nunca
almacena contraseñas — esa responsabilidad es 100% de Supabase Auth. Esto implica que
el diseño de `AuthService` de la sesión de exploración inicial (con `PasswordHasher`)
no se reutiliza tal cual para HU-01/HU-02; se rediseñará cuando las implementemos.

### HU-01 — Login del entrenador

**Nota de evolución del diseño:** el diseño inicial de `AuthService` (sesión de
exploración) asumía manejo propio de contraseñas. Al implementar de verdad HU-22 e
integrar Supabase Auth, se confirmó que esa responsabilidad es 100% de Supabase — el
diseño real de `AuthService` usa un puerto `AuthProvider` en vez de `PasswordHasher`.

**Estado:** 🔶 En progreso — rama `feature/HU-01-login-entrenador` (no fusionada).

**Hecho:**
- `src/lib/auth/authProvider.ts` — puerto `AuthProvider` (`signIn`, `signUp`) y
  errores de dominio (`InvalidCredentialsError`, `EmailInUseError`).

**Pendiente para continuar:**
- `SupabaseAuthProvider` — implementación real del puerto usando
  `supabase.auth.signInWithPassword` / `signUp`.
- `AuthService` — orquesta `AuthProvider` + `syncSupabaseUser` (ya diseñado
  conceptualmente en sesión, falta crear el archivo).
- Pruebas unitarias de `AuthService.login` (éxito, credenciales inválidas, cuenta
  desactivada, validación) con un `AuthProvider` falso en memoria.
- Server action de login + página `src/app/login/page.tsx`.
- Middleware de redirect si ya hay sesión activa (criterio 5).

### HU-02 — Registro de cliente
**Estado:** ⬜ No iniciado

### HU-03 — Login del cliente
**Estado:** ⬜ No iniciado

---

## Sprints 2 a 5

No iniciados. Se documentarán con el mismo formato (archivos, tabla de pruebas por
criterio, decisiones de diseño) a medida que se implementen, siguiendo el orden de
`5.1. Definición de Sprint Goal` del documento principal:

- **Sprint 2 — Valoraciones físicas:** HU-04, HU-05, HU-06, HU-07, HU-08, HU-09.
- **Sprint 3 — Entrenamiento:** HU-10, HU-11, HU-12, HU-13.
- **Sprint 4 — Nutrición:** HU-14, HU-15, HU-16.
- **Sprint 5 — Notificaciones:** HU-17, HU-18, HU-19, HU-20.

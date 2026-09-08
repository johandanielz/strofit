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
| 1      | Autenticación y arquitectura base | 5 (HU-21,22,01,02,03) | 5/5 | 19/19 ✅ | — |
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
7. ✅ **HU-02 — registro de cliente** — completado, 6/6 criterios verificados
   en navegador, 10/10 pruebas unitarias.
8. ✅ **HU-01 / HU-03 — login compartido con redirect por rol** — completado,
   5/5 criterios verificados en navegador, 4/4 pruebas unitarias.
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

**Estado:** ✅ Completado — 5/5 criterios de aceptación verificados en navegador,
4/4 pruebas unitarias de `AuthService.login` pasando.

**Archivos:**
- `src/lib/auth/authProvider.ts` — puerto `AuthProvider`
- `src/lib/auth/supabaseAuthProvider.ts` — implementación real con Supabase Auth
- `src/lib/auth/authService.ts` — orquesta `AuthProvider` + `syncSupabaseUser`
- `src/lib/validation/schemas.ts` — validación compartida (zod)
- `src/app/login/page.tsx` (Server Component) + `LoginForm.tsx` (Client Component)
- `src/app/login/actions.ts` — server action
- `src/proxy.ts` + `src/lib/supabase/middleware.ts` — redirect si sesión activa
- `scripts/create-entrenador.ts` — aprovisionamiento inicial (no es HU, es setup)
- `tests/auth-login.test.ts` — 4/4 pruebas

**Criterios de aceptación — verificados en navegador real, no solo en pruebas:**

| # | Criterio | Método de verificación |
|---|----------|------------------------|
| 1 | Credenciales correctas → redirect por rol | Manual, con usuario real creado vía script admin |
| 2 | Credenciales incorrectas → mensaje genérico | Manual |
| 3 | Campos vacíos → validación sin tocar backend | Manual + **verificado que la validación del servidor también aplica**, quitando `required` del HTML manualmente vía DevTools |
| 4 | Email inválido → validación de formato | Manual (mismo método que criterio 3) |
| 5 | Sesión activa → redirect automático, no muestra login | Manual, vía `proxy.ts` |

**Descubrimientos y decisiones durante la implementación (no estaban en el diseño original):**
- Prisma 7 requiere driver adapters (`@prisma/adapter-pg`) y `prisma.config.ts` en vez
  de `datasource.url` — cambio de arquitectura de la librería, no nuestro.
- Supabase Auth no lanza error en `signUp` para emails duplicados (por diseño, evita
  enumeración) — se detecta indirectamente vía `identities.length === 0`. Limitación
  conocida: no cubre el caso "email existente pero aún sin confirmar".
- Next.js 16 renombró `middleware` a `proxy` (deprecación real, migrado con el
  codemod oficial `@next/codemod middleware-to-proxy`).
- El middleware/proxy no puede usar Prisma de forma confiable en Edge Runtime —
  se resolvió leyendo el rol directamente de `user_metadata` de Supabase, sin tocar
  la base de datos en esa capa.
- Cuenta con `deletedAt` no nulo no se reactiva automáticamente al iniciar sesión
  (mismo criterio que HU-22, aplicado también aquí).

**Deuda técnica / pendiente identificado durante la implementación:**
- **No existe HU de logout** — se descubrió la ausencia al necesitar cerrar sesión
  manualmente para probar. Documentado como HU-01b nueva en `BackLog.md`, no
  implementada todavía.
- El registro de entrenador no es una HU (por diseño, un solo entrenador) — se
  resuelve con `scripts/create-entrenador.ts`, documentado en `README.md`.

### HU-01b — Cerrar sesión

**Estado:** ✅ Completado — verificado en navegador.

**Archivos:**
- `src/app/logout/actions.ts` — server action (`supabase.auth.signOut()`)
- `src/app/(app)/layout.tsx` — layout compartido para rutas autenticadas, con
  guardia de sesión (`redirect('/login')` si no hay usuario)
- `src/app/(app)/LogoutButton.tsx` — botón, Server Component (sin `useActionState`,
  no hay estado que mostrar)
- `src/app/(app)/dashboard/page.tsx` y `mi-progreso/page.tsx` — placeholders,
  primera vez que el login llega a una página real en vez de 404

**Verificación manual:**
- ✅ Login → llega al dashboard real (ya no 404)
- ✅ Clic en "Cerrar sesión" → vuelve a `/login`
- ✅ Con sesión cerrada, acceso directo a `/dashboard` → redirigido a `/login`
  (confirma que la protección vive en el layout, no solo en el botón)

**Decisión de diseño:** se usó un route group `(app)` para separar el layout de
rutas autenticadas del de `/login` — evita mostrar "Cerrar sesión" en una pantalla
donde por definición no hay sesión activa.

**Nota:** no se escribieron pruebas unitarias de Jest para esta HU — `logoutAction`
es pegamento puro hacia el SDK de Supabase (mismo criterio aplicado a
`SupabaseAuthProvider`), sin lógica de negocio propia que aislar y probar.

**Hallazgo durante la implementación (no relacionado con la HU en sí):** conflicto
conocido entre el Preflight de Tailwind (`img { height: auto }` global) y la
validación de aspect-ratio de `next/image` cuando se pasan `width`/`height` fijos —
se resolvió con un `style` inline explícito en el logo del login
(`src/app/login/page.tsx`), que tiene prioridad sobre las clases de Tailwind.

### HU-02 — Registro de cliente

**Estado:** ✅ Completado — 6/6 criterios verificados en navegador, 10/10 pruebas
unitarias de `AuthService.register`. Suite completa: 19/19.

**Archivos:**
- `src/lib/auth/clienteRepository.ts` — `ClienteRepository`, `findFirst()` para
  resolver el entrenador único del MVP
- `src/lib/auth/authService.ts` — método `register()` agregado
- `src/lib/auth/authProvider.ts` / `supabaseAuthProvider.ts` — extendidos con
  `telefono` en `signUp`
- `src/lib/auth/syncUser.ts` — `SyncedUser` extendido con `telefono`
- `src/app/register/page.tsx` + `RegisterForm.tsx` + `actions.ts`
- `tests/auth-login.test.ts` — 10 pruebas nuevas agregadas (mismo archivo que login,
  reutiliza los helpers falsos ya existentes)

**Verificación manual contra Supabase real:**
- ✅ Registro exitoso → `User` y `Cliente` creados correctamente
- ✅ `Cliente.entrenadorId` apunta al entrenador real (vía `findFirst()`)
- ✅ Sin sesión activa después del registro (criterio 1: redirige a login, no
  autentica automáticamente)

**Decisión de diseño (documentada antes de implementar):** `findFirst()` para
resolver el entrenador único del MVP en vez de un selector — YAGNI consciente,
ver nota en `BackLog.md` → HU-02.

**Deuda técnica identificada (aceptada conscientemente):** la creación de `User`
y `Cliente` no está en una transacción — si `crearParaUsuario` falla después de
que `syncSupabaseUser` ya creó el `User`, queda un `User` sin `Cliente`
correspondiente. Bajo riesgo en el MVP (un solo entrenador, siempre disponible
tras `create-entrenador.ts`); se resolvería con `prisma.$transaction` en un futuro
sprint de hardening.

**Hallazgos importantes durante la implementación:**
1. **`ts-jest` no estaba chequeando tipos completos** — `isolatedModules: true`
   (heredado del `tsconfig.json` de Next.js) hacía que Jest compilara cada archivo
   de forma aislada, sin detectar errores de tipos entre archivos (argumentos
   faltantes, propiedades requeridas ausentes). Corregido con
   `isolatedModules: false` explícito en `jest.config.js`. Confirmado con
   `tsc --noEmit` como referencia cruzada antes de confiar en el fix.
2. **`create-entrenador.ts` no creaba las filas en Prisma** — solo creaba el
   usuario en Supabase Auth, dejando `Entrenador` vacío en la base de datos.
   Causó el primer intento de registro real (fallido con
   `SIN_ENTRENADOR_DISPONIBLE`). Corregido para crear `User` y `Entrenador`
   también en Prisma.
3. **Desactivar "Confirm email" en Supabase cambió el comportamiento de `signUp`**
   — pasó a devolver sesión activa automáticamente. Como HU-02 no debe autenticar
   al registrarse, se agregó un `supabase.auth.signOut()` explícito en la server
   action antes del redirect a `/login`. Sin este ajuste, `proxy.ts` (de HU-01,
   criterio 5) redirigía al dashboard en vez de mostrar el login.

### HU-03 — Login del cliente
**Estado:** ✅ Completado — cubierta por la misma implementación de HU-01
(`AuthService.login` no distingue rol al autenticar; el redirect sí varía según
`User.rol`, verificado con el usuario de prueba con rol `ENTRENADOR`). No requirió
archivos ni pruebas adicionales — ver HU-01 arriba para el detalle completo.

---

## Sprints 2 a 5

No iniciados. Se documentarán con el mismo formato (archivos, tabla de pruebas por
criterio, decisiones de diseño) a medida que se implementen, siguiendo el orden de
`5.1. Definición de Sprint Goal` del documento principal:

- **Sprint 2 — Valoraciones físicas:** HU-04, HU-05, HU-06, HU-07, HU-08, HU-09.
- **Sprint 3 — Entrenamiento:** HU-10, HU-11, HU-12, HU-13.
- **Sprint 4 — Nutrición:** HU-14, HU-15, HU-16.
- **Sprint 5 — Notificaciones:** HU-17, HU-18, HU-19, HU-20.

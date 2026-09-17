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
| 1      | Autenticación y arquitectura base | 9 (HU-21,22,01,01b,02,02b,02c,02d,03) | 6/9 | 30/30 ✅ | — |
| 2      | Valoraciones físicas            | 6 (HU-04 a HU-09) | 4/6 completas (HU-06 parcial) | 53/53 | — |
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

### HU-02 — Registro de cliente (reemplazada por HU-02b)

**Estado:** 🔶 Reemplazada — ver HU-02b. La lógica de `AuthService.register()`
se mantuvo y se extendió, pero el flujo público (`/register`) fue eliminado
por la preocupación de seguridad documentada en `BackLog.md`.

**Nota histórica:** esta sección documenta la implementación original (público,
sin los campos de perfil) tal como se construyó y verificó en su momento —
se conserva como registro de cómo evolucionó el diseño, no como estado actual.
Ver HU-02b arriba para el estado y archivos vigentes.

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

### HU-02b — Alta de cliente por el entrenador

**Estado:** 🔶 Implementado (parcial) — verificado manualmente en navegador
contra Supabase real, sin pruebas unitarias nuevas dedicadas (se reutilizan
y actualizaron las 10 de `AuthService.register`).

**Archivos:**
- `src/lib/auth/clienteRepository.ts` — `crearParaUsuario` extendido con
  `sexo`, `fechaNacimiento`, `factorActividad`
- `src/lib/auth/authService.ts` — `register()` ya no recibe password, genera
  una con `passwordGenerator.ts`
- `src/lib/auth/passwordGenerator.ts` — nuevo, genera contraseña de 10
  caracteres sin ambigüedad visual (excluye 0/O, 1/l/I)
- `src/lib/validation/schemas.ts` — `altaClienteInputSchema`, `sexoSchema`,
  `fechaNacimientoSchema`, `factorActividadSchema`
- `src/lib/valoracion/factorActividad.ts` — constante con los 5 niveles
  válidos (valor numérico usado directo en fórmulas + etiqueta legible)
- `prisma/schema.prisma` — `Cliente` extendido con `sexo` (enum),
  `fechaNacimiento`, `factorActividad`
- `src/app/(app)/clientes/` — `actions.ts`, `AltaClienteForm.tsx`, `page.tsx`
- `tests/auth-login.test.ts` — bloque de HU-02 reemplazado por HU-02b,
  10 pruebas (2 nuevas: factor de actividad inválido, sexo inválido)

**Verificación manual contra Supabase real:**
- ✅ Formulario completo → cliente creado en `User` y `Cliente` con todos
  los campos nuevos correctos
- ✅ Contraseña generada se muestra una sola vez en pantalla
- ✅ El cliente creado puede iniciar sesión con esa contraseña y es
  redirigido a `/mi-progreso` (no `/dashboard`, confirma que `User.rol`
  funciona correctamente)

**Origen de esta HU:** surgió al revisar con el entrenador los datos reales
de valoración física para HU-05 (ver `BackLog.md` → HU-02 para el detalle
completo de la decisión y las opciones consideradas).

**Decisión relacionada tomada hoy:** `/register` (registro público) se
eliminó completamente — la carpeta `src/app/register/` ya no existe.

**Nuevas historias descubiertas al verificar el login del cliente:**
- **HU-02c** (cambiar contraseña) y **HU-02d** (restablecer contraseña
  olvidada) — surgieron al notar que la contraseña generada es compleja y el
  cliente no tiene forma de cambiarla ni recuperarla si la olvida. Ninguna
  implementada todavía.

**Hallazgo técnico:** borrar `.next/` (necesario tras eliminar una ruta)
deja temporalmente sin generar los tipos de Next.js (`LayoutProps`, etc.) —
`npx tsc --noEmit` falla hasta que se corre `npm run dev` una vez para que
Next.js los regenere.

### HU-03 — Login del cliente
**Estado:** ✅ Completado — cubierta por la misma implementación de HU-01
(`AuthService.login` no distingue rol al autenticar; el redirect sí varía según
`User.rol`, verificado con el usuario de prueba con rol `ENTRENADOR`). No requirió
archivos ni pruebas adicionales — ver HU-01 arriba para el detalle completo.

---

## Sprint 2 — Valoraciones físicas

### HU-04 — Agenda de valoraciones (cierre)

**Estado:** ✅ Completado — 7 criterios de aceptación verificados en
navegador.

**Archivos de esta sesión:**
- `src/lib/agenda/horarioTrabajo.ts` — horario real del entrenador
  (bloques mañana/tarde con hueco de almuerzo, sábado distinto), 7/7 pruebas
- `src/lib/agenda/agendaRepository.ts` — `obtenerCitasEnRango`,
  `AgendaCitaConCliente` (extiende `AgendaCita` solo para este método)
- `src/lib/agenda/agendaService.ts` — `obtenerSemana` combina franjas +
  citas reales en la estructura `DiaCalendario[]`
- `src/app/(app)/agenda/` — movido desde `src/app/agenda/` (protección de
  sesión), `page.tsx`, `CalendarioSemana.tsx`, `actions.ts` extendido

**Pruebas:** 7/7 nuevas de horario de trabajo. Suite completa: 50/50.

**Verificación manual contra Supabase real:**
- ✅ Vista de calendario semanal con franjas correctas (disponibles,
  fuera de horario, ocupadas)
- ✅ Agendar desde clic en franja libre (modal)
- ✅ Reagendar y cancelar desde clic en cita existente (modal)
- ✅ Citas canceladas se muestran tachadas, no clicables
- ✅ **Conexión HU-04 → HU-05 verificada:** botón "Registrar valoración"
  desde el modal de una cita → formulario preseleccionado con cliente y
  altura sugerida → al guardar, la `CitaAgenda` correspondiente queda
  `realizada: true` (transacción atómica de HU-05, ver Progress.md → HU-05)

**Bugs encontrados y corregidos durante la verificación manual:**
1. **Contraste de texto insuficiente** en encabezados del calendario y
   campos del modal — clases sin color explícito heredaban gris claro
2. **`setState` durante render** — `ModalAgendar` llamaba `onClose()`
   (que actualiza el estado del padre) directamente en el cuerpo del
   componente en vez de en un `useEffect`, violando las reglas de React
3. **`useEffect` mal ubicado dentro de JSX** — al conectar la cita con
   el formulario de valoración, un `useEffect` quedó pegado dentro del
   `return()` en vez de en el cuerpo de la función, causando errores de
   parsing de JSX (`if` y hooks no son expresiones válidas dentro de `{}`)

**Decisión de diseño:** vista de semana en vez de mes/día — cubre el
caso de uso real sin la complejidad de una cuadrícula mensual completa.
Documentado como mejora futura (ver `BackLog.md`).

### HU-05 — Registro de valoración física

**Estado:** 🔶 En progreso — lógica de negocio completa y validada, UI
pendiente.

**Archivos:**
- `prisma/schema.prisma` — modelo `Valoracion` migrado (46 columnas:
  pliegues, medidas con lado izq/der, punto crítico, calculados)
- `src/lib/valoracion/calculoValoracion.ts` — función pura, fórmulas
  Jackson & Pollock (% grasa) y Cunningham (calorías basales)
- `src/lib/valoracion/valoracionRepository.ts` — `crear()` usa
  `prisma.$transaction` para marcar la `CitaAgenda` como `realizada`
  atómicamente junto con la creación de la valoración
- `src/lib/valoracion/valoracionService.ts` — orquesta validación,
  resuelve altura sugerida, calcula y guarda
- `tests/calculoValoracion.test.ts` — 7/7 pruebas
- `tests/valoracion.test.ts` — 6/6 pruebas

**Pruebas:** 13/13 ✅ — incluye validación contra datos **reales** del
Excel del entrenador (Σ7=178mm, edad=27, peso=98.15kg → %grasa=24.04%,
coincide exactamente con el cálculo manual de Juan Pablo).

**Hallazgo importante:** el "ejemplo práctico" de la imagen de referencia
(hombre 30 años, 80kg, Σ7=100mm → DC≈1.0665) no coincide exactamente con
la fórmula aplicada con precisión completa (da DC=1.0653532) — se
determinó que el ejemplo de la imagen tenía redondeo intermedio, y se
confió en la fórmula exacta, validada independientemente contra datos
reales del Excel.

**Decisiones de diseño:**
- Campos calculados se guardan como "snapshot" en el momento de la
  valoración (no se recalculan al consultar el historial), pero se
  recalculan si esa valoración específica se edita — evita
  recalcular contra datos que ya no representan ese momento
- `altura` vive en `Valoracion` (no en `Cliente`), con `factorActividad`
  también como snapshot — ambos pueden cambiar con el tiempo
- Primera valoración de un cliente: `altura` es obligatoria. Valoraciones
  siguientes: si no se envía, el backend usa la de la última valoración
  (red de seguridad) — la UI (pendiente) debe pre-llenar el campo para
  que el entrenador nunca vea un campo vacío que se llena "mágicamente"
- Pliegues: 9 se registran (incluye bicipital y pantorrilla), solo 7
  entran en la fórmula oficial — mapeo confirmado con el entrenador
- Medidas con lado izquierdo/derecho: brazo, antebrazo, pierna alta,
  pierna, pierna baja, pantorrilla (7 pares) — confirmado con el
  entrenador, incluida la corrección de pantorrilla (inicialmente un
  solo campo, corregido tras confirmar con Juan Pablo)
- Punto crítico: dos campos separados (nombre + medida), no texto libre
  combinado — decisión para facilitar análisis futuro

**Estado:** ✅ Completado — verificado en navegador contra Supabase real,
con un cliente real (`Pepito Perez`), coincidiendo exactamente con los
cálculos validados a mano.

**Archivos adicionales de esta sesión:**
- `src/app/(app)/valoraciones/ValoracionForm.tsx` — formulario completo
  (~30 campos generados desde arrays, no escritos a mano uno por uno)
- `src/app/(app)/valoraciones/page.tsx` — Server Component, carga clientes
  antes de renderizar
- `src/app/(app)/valoraciones/actions.ts` — `registrarValoracionAction`,
  `obtenerClientesDelEntrenador`, `obtenerAlturaSugerida`
- `src/lib/auth/getEntrenadorId.ts` — extraído de `agenda/actions.ts` para
  reutilizar entre HU-04 y HU-05

**Bugs encontrados y corregidos durante la verificación manual (no
detectables con pruebas unitarias, solo probando en navegador real):**
1. **Campos opcionales vacíos rotos** — `""` de un input HTML se coerciona a
   `NaN` con `z.coerce.number()`, fallando `.positive()` aunque el campo
   fuera opcional. Corregido con `z.preprocess()` que convierte `""` a
   `undefined` antes de la coerción.
2. **Label "Fecha" ambiguo** — se confundió con fecha de nacimiento en la
   primera prueba manual, produciendo una edad negativa y cálculos
   completamente incorrectos en cascada. Corregido: label →
   "Fecha de la valoración", pre-llenada con la fecha actual.
3. **Desfase de zona horaria (UTC vs. Colombia)** — `toISOString()` siempre
   convierte a UTC; en horas de la tarde/noche en Colombia (UTC-5), esto
   mostraba la fecha de mañana en vez de hoy. Corregido calculando la fecha
   local con `getFullYear()/getMonth()/getDate()`, que sí respetan la zona
   horaria del navegador.

**Verificación final exitosa (cliente real, fecha real):**
Σ7=178mm, fechaNacimiento=2000-09-13, fecha=2026-09-14 (edad=26) →
porcentajeGrasa=23.91%, masaGrasa=23.47kg, masaLibreGrasa=74.68kg — todo
coincide con el cálculo manual de verificación.

**Único pendiente:** verificar que registrar una valoración desde una
`CitaAgenda` marca esa cita como `realizada` — se prueba junto con el
cierre de HU-04 en la próxima sesión (necesita la UI de calendario para
generar el flujo completo de principio a fin).

### HU-06 — Subida de 4 fotos por valoración

**Estado:** ✅ Completado (parcial) — subida verificada en navegador contra
Supabase Storage real. Lectura/visualización de fotos ya subidas queda
pendiente.

**Archivos:**
- Bucket `fotos-valoraciones` en Supabase Storage — privado, límite 5MB,
  solo `image/jpeg`, `image/png`, `image/webp`; 4 políticas RLS
  (SELECT/INSERT/UPDATE/DELETE, restringidas a `authenticated` + este bucket)
- `prisma/schema.prisma` — modelo `FotoValoracion`, enum `AnguloFoto`,
  `@@unique([valoracionId, angulo])` (permite upsert en vez de duplicar)
- `src/lib/valoracion/fotoValoracionRepository.ts` — `guardarOReemplazar`
  usa `prisma.fotoValoracion.upsert`
- `src/lib/valoracion/subirFoto.ts` — sube directo del navegador a Storage
  (`'use client'` en un archivo sin JSX, primera vez en el proyecto),
  con `{ upsert: true }` del lado de Storage también
- `src/app/(app)/valoraciones/[valoracionId]/fotos/` — `FotosForm.tsx`
  (previsualización con `URL.createObjectURL`, subida secuencial no
  paralela para identificar fallos por ángulo), `page.tsx`, `actions.ts`
  (`guardarRutaFoto`)
- `registrarValoracionAction` ajustada para redirigir a esta página tras
  guardar la valoración (en vez de mostrar éxito inline)

**Decisión de arquitectura:** autorización de Storage se mantiene simple
a nivel de RLS (solo "usuario autenticado"), consistente con el patrón ya
establecido en el proyecto de resolver lógica de negocio compleja en la
capa de aplicación (no en políticas SQL) — mismo criterio que
`assertClienteDelEntrenador` de HU-07.

**Verificación manual contra Supabase real:**
- ✅ Selección y previsualización de múltiples fotos sin subir nada
  hasta confirmar
- ✅ Subida conjunta de varias fotos, guardadas correctamente en Storage
  y en `FotoValoracion`
- ✅ Mensaje de confirmación visible antes de redirigir

**Bug encontrado y corregido durante la verificación manual:** primera
versión navegaba inmediatamente tras subir, sin dar tiempo a ver ningún
mensaje de confirmación — un `router.push()` fuera del `setTimeout`
competía con el que sí esperaba, y el estado `exito` nunca se activaba.
Corregido: solo un `router.push()`, dentro del `setTimeout`, después de
`setExito(true)`.

**Pendiente explícito para una sesión futura:**
- Mostrar las fotos ya subidas (ej. en el historial de valoraciones de
  HU-07) — hoy la funcionalidad es de solo escritura, sin lectura visual
- Considerar URLs firmadas temporales para el acceso de lectura, en vez
  de exponer rutas directas

### HU-07 — Informe de valoraciones (entrenador)

**Estado:** ✅ Completado — verificado en navegador contra Supabase real,
incluyendo el caso de seguridad.

**Archivos:**
- `src/lib/auth/guards.ts` — `assertClienteDelEntrenador`,
  `AccesoNoAutorizadoError`, `GuardsRepository`/`prismaGuardsRepository`
  (primera implementación real de autorización a nivel de aplicación en
  el proyecto — antes solo se había discutido conceptualmente)
- `src/app/(app)/clientes/lista/page.tsx` + `ListaFiltro.tsx` — lista de
  clientes con filtro de búsqueda en tiempo real (Client Component,
  filtra en memoria, sin consultas nuevas al servidor)
- `src/app/(app)/clientes/[clienteId]/historial/page.tsx` — tabla de
  historial, protegida con `assertClienteDelEntrenador` + `notFound()`
- `src/app/not-found.tsx` — página 404 personalizada con estilo de marca
- `tests/guards.test.ts` — 3/3 pruebas

**Pruebas:** 3/3 nuevas. Suite completa: 53/53.

**Verificación manual contra Supabase real:**
- ✅ Lista de clientes con filtro funcionando
- ✅ Historial completo mostrando todas las métricas calculadas
- ✅ Acceso con `clienteId` inexistente → 404 (no revela si el cliente
  existe o no, mismo principio que el mensaje genérico de HU-01)

**Hallazgo importante (no bug, aclaración necesaria):** la sesión persiste
entre apagados del PC porque Supabase Auth guarda el token en una cookie
de disco (no en memoria), con renovación automática — comportamiento
esperado, no un problema de seguridad.

**Decisión de alcance documentada en `BackLog.md`:** se implementa la
tabla cronológica sin gráficas de evolución — las gráficas quedan como
mejora post-MVP explícita, no como omisión accidental.

**Nota sobre HU-06:** pospuesta detrás de HU-07 por decisión de
priorización — el valor de "poder consultar lo ya registrado" se
consideró más urgente que "poder subir fotos", dado el tiempo limitado
del MVP.

## Sprints 2 a 5

No iniciados. Se documentarán con el mismo formato (archivos, tabla de pruebas por
criterio, decisiones de diseño) a medida que se implementen, siguiendo el orden de
`5.1. Definición de Sprint Goal` del documento principal:

- **Sprint 2 — Valoraciones físicas:** HU-04, HU-05, HU-06, HU-07, HU-08, HU-09.
- **Sprint 3 — Entrenamiento:** HU-10, HU-11, HU-12, HU-13.
- **Sprint 4 — Nutrición:** HU-14, HU-15, HU-16.
- **Sprint 5 — Notificaciones:** HU-17, HU-18, HU-19, HU-20.

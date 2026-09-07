# BackLog — StroFit

> Fuente de verdad del backlog del proyecto. El estado de cada historia se sincroniza
> con [`Progress.md`](./Progress.md); si hay una discrepancia entre ambos archivos,
> `Progress.md` manda porque refleja lo que realmente pasa la suite de pruebas.

## Convenciones

- **Estado**: `No iniciado` · `En progreso` · `Implementado` (código + pruebas unitarias
  pasando, pendiente de UI/integración real) · `Completado` (además probado end-to-end).
- **MoSCoW**: Must / Should / Could / Won't (para este MVP no hay `Won't` explícitos).
- Las historias HU-21 y HU-22 son historias **técnicas** (no las pidió el negocio
  directamente, pero son prerrequisito de todas las demás) — se agregan siguiendo la
  recomendación de modelar el dato antes de construir sobre él, y de no dejar nunca una
  sesión autenticada sin un `User` sincronizado en la base de datos propia.

## Índice de historias

| ID     | Historia                                            | MoSCoW | Sprint | Estado        |
|--------|------------------------------------------------------|--------|--------|----------------|
| HU-21  | Modelo de datos base (Prisma schema completo)        | Must   | 1      | Implementado (parcial) |
| HU-22  | Sincronización de usuarios con Supabase Auth         | Must   | 1      | Completado     |
| HU-01  | Login del entrenador                                  | Must   | 1      | Completado     |
| HU-01b | Cerrar sesión                                         | Must   | 1      | Completado    |
| HU-02  | Registro de cliente                                   | Must   | 1      | No iniciado    |
| HU-03  | Login del cliente                                     | Must   | 1      | Completado     |
| HU-04  | Agenda de valoraciones                                | Must   | 2      | No iniciado    |
| HU-05  | Registro de valoración física                         | Must   | 2      | No iniciado    |
| HU-06  | Subida de 4 fotos por valoración                       | Should | 2      | No iniciado    |
| HU-07  | Informe de valoraciones (entrenador)                   | Should | 2      | No iniciado    |
| HU-08  | Comparativo de fotos                                   | Could  | 2      | No iniciado    |
| HU-09  | Informe de valoraciones (cliente)                      | Should | 2      | No iniciado    |
| HU-10  | Creación de plan de entrenamiento                      | Must   | 3      | No iniciado    |
| HU-11  | Visualización del entrenamiento (cliente)              | Must   | 3      | No iniciado    |
| HU-12  | Registro de series ejecutadas                          | Should | 3      | No iniciado    |
| HU-13  | Video de referencia del ejercicio                      | Could  | 3      | No iniciado    |
| HU-14  | Creación de plan de alimentación mensual                | Must   | 4      | No iniciado    |
| HU-15  | Visualización del plan alimenticio + lista de compras   | Must   | 4      | No iniciado    |
| HU-16  | Informe de planes alimenticios                          | Should | 4      | No iniciado    |
| HU-17  | Notificación: valoración agendada                       | Could  | 5      | No iniciado    |
| HU-18  | Notificación: valoración realizada                      | Could  | 5      | No iniciado    |
| HU-19  | Notificación: plan de entrenamiento asignado             | Could  | 5      | No iniciado    |
| HU-20  | Notificación: guía alimenticia creada                   | Could  | 5      | No iniciado    |

---

## HU-21 — Modelo de datos base *(nueva, técnica)*

**Como** equipo de desarrollo, **quiero** tener el modelo de datos completo en Prisma
para Autenticación, Valoraciones, Entrenamientos y Nutrición **para** tener una base
consistente antes de implementar las HU de negocio y evitar migraciones costosas a
mitad de sprint.

**Contexto:** incluye la separación `Ejercicio` (plantilla que define el entrenador)
vs. `RegistroSerie` (lo que el cliente ejecuta), acordada explícitamente para no
mezclar "lo planeado" con "lo realmente hecho".

**Criterios de aceptación:**
1. Given que se necesita registrar el catálogo reutilizable de ejercicios y alimentos,
   When se define el schema, Then existen `EjercicioBiblioteca` y `AlimentoBiblioteca`
   como catálogos independientes, reutilizables entre planes y clientes.
2. Given que un plan de entrenamiento define cuántas series tiene cada ejercicio, When
   el cliente registra su ejecución diaria, Then los datos se guardan en `RegistroSerie`
   con una clave única `(ejercicioId, fecha, numeroSerie)` que evita duplicados y
   permite upsert idempotente.
3. Given que un plan (entrenamiento o alimenticio) se reemplaza por uno nuevo, When se
   crea el nuevo plan, Then el modelo soporta el estado `ARCHIVADO` sin perder el
   historial (no se borra, se marca).
4. Given que una valoración requiere exactamente 4 fotos por ángulo, When se modela la
   entidad `FotoValoracion`, Then existe una restricción única `(valoracionId, angulo)`
   que impide duplicar ángulos y permite reemplazar sin acumular archivos huérfanos.
5. Given que el acceso a datos de un cliente debe poder resolverse por
   entrenador-dueño, When se modela `Cliente`, Then la relación con `Entrenador` es
   directa y consultable en una sola consulta (soporta la capa de autorización de
   HU-07 #7 / HU-09 #6 sin joins complejos).

**Estado:** 🔶 Implementado (parcial) — modelos `User`, `Entrenador`, `Cliente`
migrados contra Supabase real, con soft deletes. Faltan las entidades de
Valoraciones, Entrenamientos, Nutrición y Notificaciones (se agregan en sus
respectivos sprints).

---

## HU-22 — Sincronización de usuarios con Supabase Auth *(nueva, técnica)*

**Como** sistema, **quiero** sincronizar automáticamente los usuarios de Supabase Auth
con la tabla `User` de Prisma **para** que cada usuario autenticado tenga un registro
correspondiente con su rol y datos de perfil, y para que ninguna sesión válida pueda
operar sin un `User` asociado en nuestra base de datos.

**Criterios de aceptación:**
1. Given que un usuario se autentica correctamente en Supabase Auth por primera vez,
   When el sistema ejecuta la sincronización, Then crea un registro en `User` con
   `supabaseUserId`, `email` y `rol` tomados de los metadatos de Supabase.
2. Given que un usuario ya sincronizado inicia sesión de nuevo, When se ejecuta la
   sincronización, Then el sistema no crea un nuevo registro sino que retorna el
   existente (idempotencia).
3. Given que el email del usuario cambió en Supabase Auth, When se sincroniza, Then el
   sistema actualiza el email en `User` conservando el mismo `id`.
4. Given que la sincronización falla, When ocurre el error, Then el flujo de
   autenticación no continúa sin un `User` válido asociado (nunca se otorga acceso a
   datos de negocio sin un usuario sincronizado).
5. Given que un usuario de Supabase Auth no tiene rol definido en sus metadatos, When
   se intenta sincronizar, Then el sistema rechaza la sincronización (`ROL_INDEFINIDO`)
   y no crea el registro.
6. Given que un usuario tiene un registro `User` con `deletedAt` no nulo (fue dado
   de baja explícitamente), When intenta sincronizarse de nuevo (inicia sesión con
   el mismo `supabaseUserId`), Then el sistema lo reconoce pero **no reactiva la
   cuenta automáticamente** — devuelve un estado que indica cuenta desactivada, sin
   otorgar acceso a datos de negocio. La reactivación requiere una acción explícita
   (fuera del alcance de HU-22; queda como HU futura si se necesita).

**Estado:** ✅ Completado — implementado y verificado contra Supabase real,
5/5 pruebas unitarias.

---

## HU-01 — Login del entrenador

**Como** entrenador, **quiero** iniciar sesión **para** ingresar a la plataforma.

> **Nota de arquitectura (agregada al integrar HU-22):** el diseño de `AuthService`
> de la sesión de exploración inicial asumía que la aplicación maneja contraseñas
> directamente (`PasswordHasher`, hash propio). Como el proyecto sí usa Supabase Auth
> como proveedor de identidad real, **ese diseño no se reutiliza tal cual**. El flujo
> correcto es: Supabase Auth valida email/contraseña → se llama a `syncSupabaseUser`
> (HU-22) para reflejar esa identidad en nuestra tabla `User` → se usa `User.rol`
> para decidir el redirect. `AuthService` se rediseñará cuando implementemos HU-01/02,
> ya sin `PasswordHasher` — esa responsabilidad es 100% de Supabase Auth.

**Criterios de aceptación:** (sin cambios respecto al documento principal)
1. Credenciales correctas → autentica y redirige al dashboard del entrenador.
2. Credenciales incorrectas → mensaje de error genérico, sin revelar si el email existe.
3. Campos vacíos → validación de campo obligatorio, sin llamar al backend.
4. Email con formato inválido → validación de formato antes de autenticar.
5. Sesión ya activa → redirige automáticamente al dashboard.

**Estado:** ✅ Completado — 5/5 criterios verificados en navegador, 4/4 pruebas
unitarias. El criterio 5 (redirect si sesión activa) se resolvió con `proxy.ts`
(antes `middleware.ts`; Next.js 16 renombró la convención durante la implementación).

---

## HU-01b — Cerrar sesión *(nueva, no estaba en el backlog original)*

**Como** entrenador o cliente autenticado, **quiero** poder cerrar sesión **para**
proteger mi cuenta si uso un dispositivo compartido.

**Descubierta durante la implementación de HU-01**: no había ninguna historia que
cubriera el logout — se detectó al necesitar cerrar sesión manualmente (vía DevTools)
para poder probar los criterios 3/4/5 de HU-01 sin la interferencia del middleware.

**Criterios de aceptación (borrador):**
1. Given que el usuario está autenticado, When hace clic en "Cerrar sesión", Then el
   sistema invalida su sesión (`supabase.auth.signOut()`) y lo redirige a `/login`.

**Estado:** ✅ Completado — verificado en navegador (login → dashboard real →
logout → intento de acceso directo bloqueado por el layout de `(app)`).

---

## HU-02 — Registro de cliente

**Como** cliente, **quiero** registrarme **para** después poder iniciar sesión.

> **Nota de arquitectura (agregada al integrar HU-22):** el diseño de `AuthService`
> de la sesión de exploración inicial asumía que la aplicación maneja contraseñas
> directamente (`PasswordHasher`, hash propio). Como el proyecto sí usa Supabase Auth
> como proveedor de identidad real, **ese diseño no se reutiliza tal cual**. El flujo
> correcto es: Supabase Auth valida email/contraseña → se llama a `syncSupabaseUser`
> (HU-22) para reflejar esa identidad en nuestra tabla `User` → se usa `User.rol`
> para decidir el redirect. `AuthService` se rediseñará cuando implementemos HU-01/02,
> ya sin `PasswordHasher` — esa responsabilidad es 100% de Supabase Auth.

**Criterios de aceptación:** (sin cambios respecto al documento principal)
1. Datos válidos → crea la cuenta con rol Cliente, redirige a login, sin verificación
   de email.
2. Email ya registrado → mensaje de email en uso, no crea la cuenta.
3. Campo obligatorio vacío → validación, sin llamar al backend.
4. Email con formato inválido → validación de formato.
5. Teléfono con formato inválido → validación de formato.
6. Password que no cumple requisitos mínimos → mensaje de requisitos no cumplidos.

**Estado:** ⬜ No iniciado.

---

## HU-03 — Login del cliente

**Como** cliente, **quiero** iniciar sesión **para** ingresar a la plataforma.

Comparte flujo y criterios con HU-01; la única salvedad es el rol resultante.

**Estado:** ✅ Completado — cubierta por la misma implementación de HU-01
(`AuthService.login` no distingue rol al autenticar, el redirect sí varía según
`User.rol`). Ver `Progress.md` → HU-01 para el detalle de archivos y pruebas.

---

## HU-04 a HU-20

Sin cambios de contenido respecto al documento principal
(`Documentación_Proyecto_Integrador_II`, sección 3.2), salvo la corrección ya aplicada
en HU-19/HU-20: **solo la creación de un nuevo plan dispara notificación; las
ediciones de un plan vigente no notifican.** Ver ese documento para el detalle
completo de los criterios Given/When/Then de cada una — no se duplican aquí para
evitar que este archivo y el documento fuente diverjan.

**Estado de todas:** ⬜ No iniciado (planificadas para Sprints 2 a 5, según
`5.2. Sprint BackLog con tareas` del documento principal).

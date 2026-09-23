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

| ID     | Historia                                               | MoSCoW | Sprint | Estado         |
|--------|--------------------------------------------------------|--------|--------|----------------|
| HU-21  | Modelo de datos base (Prisma schema completo)          | Must   | 1      | Implementado (parcial) |
| HU-22  | Sincronización de usuarios con Supabase Auth           | Must   | 1      | Completado     |
| HU-01  | Login del entrenador                                   | Must   | 1      | Completado     |
| HU-01b | Cerrar sesión                                          | Must   | 1      | Completado     |
| HU-02  | Registro de cliente                                    | Must   | 1      | Reemplazada    |
| HU-02b | Alta de cliente por el entrenador                      | Must   | 1      | Implementado (parcial) |
| HU-02c | Cambiar contraseña (usuario autenticado)               | Must   | 1      | No iniciado    |
| HU-02d | Restablecer contraseña olvidada                        | Must   | 1      | No iniciado    |
| HU-03  | Login del cliente                                      | Must   | 1      | Completado     |
| HU-04  | Agenda de valoraciones                                 | Must   | 2      | Completado     |
| HU-05  | Registro de valoración física                          | Must   | 2      | Completado     |
| HU-06  | Subida de 4 fotos por valoración                       | Should | 2      | Completado (parcial)    |
| HU-07  | Informe de valoraciones (entrenador)                   | Should | 2      | Completado     |
| HU-08  | Comparativo de fotos                                   | Could  | 2      | No iniciado    |
| HU-09  | Informe de valoraciones (cliente)                      | Should | 2      | No iniciado    |
| HU-10  | Creación de plan de entrenamiento                      | Must   | 3      | Completado     |
| HU-10b | Control diario                                         | Must   | 3      | No iniciado    |
| HU-10c | Test pre/post de sesión                                | Could  | 3      | No iniciado    |
| HU-10d | Coach View                                             | Could  | 3      | No iniciado    |
| HU-11  | Visualización del entrenamiento (cliente)              | Must   | 3      | No iniciado    |
| HU-12  | Registro de series ejecutadas                          | Should | 3      | No iniciado    |
| HU-13  | Video de referencia del ejercicio                      | Could  | 3      | No iniciado    |
| HU-14  | Creación de plan de alimentación mensual               | Must   | 4      | No iniciado    |
| HU-15  | Visualización del plan alimenticio + lista de compras  | Must   | 4      | No iniciado    |
| HU-16  | Informe de planes alimenticios                         | Should | 4      | No iniciado    |
| HU-17  | Notificación: valoración agendada                      | Could  | 5      | No iniciado    |
| HU-18  | Notificación: valoración realizada                     | Could  | 5      | No iniciado    |
| HU-19  | Notificación: plan de entrenamiento asignado           | Could  | 5      | No iniciado    |
| HU-20  | Notificación: guía alimenticia creada                  | Could  | 5      | No iniciado    |

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

> **Nota de diseño (decidida al implementar):** el modelo de datos ya soporta
> múltiples entrenadores (`Cliente.entrenadorId` es una relación real, no un
> valor fijo), pero el MVP es explícitamente de un solo entrenador. Se resuelve
> con `prisma.entrenador.findFirst()` al registrar un cliente nuevo — funciona
> hoy sin necesidad de un selector de entrenador, y el día que se soporten varios,
> el cambio es reemplazar esa única línea por la selección real del usuario, sin
> tocar el resto de la arquitectura (YAGNI aplicado conscientemente, no por
> descuido).

> **Cambio de diseño (decidido al confirmar datos con el entrenador para HU-05):**
> el registro público en `/register` se elimina. Preocupación real de negocio: el
> sistema asignaba automáticamente cualquier registro nuevo al único entrenador
> existente, sin que él lo supiera ni aprobara — cualquiera con el link podía
> vincularse. Se reemplaza por **HU-02b: alta de cliente por el entrenador**
> (ver abajo). La lógica de `AuthService.register()` y sus pruebas siguen siendo
> válidas — cambia *quién* la dispara, no *cómo* funciona.
>
> **Descartado por ahora, no por siempre:** invitaciones individuales por email
> con link único (más seguro, más profesional) — requiere infraestructura de envío
> de correo transaccional que no está montada. Queda como mejora post-MVP.

**Estado:** 🔶 Reemplazada — ver HU-02b. La lógica de `AuthService.register()`
sigue siendo válida y reutilizable, solo cambia quién la dispara.

---

## HU-02b — Alta de cliente por el entrenador *(nueva, reemplaza el registro público de HU-02)*

**Como** entrenador, **quiero** dar de alta a un cliente nuevo yo mismo **para**
controlar exactamente quién queda vinculado a mí, evitando que cualquiera con el
link de registro se asocie sin mi conocimiento.

**Criterios de aceptación:**
1. Given que el entrenador está autenticado, When accede a "Agregar cliente" e
   ingresa nombre, email, teléfono, sexo, fecha de nacimiento y factor de
   actividad, Then el sistema crea la cuenta del cliente (rol `CLIENTE`,
   vinculada a este entrenador) con una contraseña inicial.
2. Given que el email ya está registrado, When el entrenador intenta crear el
   cliente, Then el sistema muestra un mensaje de email en uso, sin crear
   la cuenta.
3. Given que el cliente fue creado, When el entrenador necesita comunicarle el
   acceso, Then el sistema muestra la contraseña inicial una sola vez en pantalla
   (no se reenvía ni se guarda en texto plano) para que el entrenador se la
   comparta manualmente (mismo canal que usa hoy, WhatsApp).

**Estado:** 🔶 Implementado (parcial) — flujo completo funcionando y verificado
contra Supabase real (creación de User + Cliente con sexo/fechaNacimiento/
factorActividad, contraseña generada mostrada una sola vez, login del cliente
con esa contraseña verificado). Pendiente: pruebas unitarias específicas de
la server action/UI (se reutilizan las 10 de `AuthService.register` ya
existentes).

---

## HU-02c — Cambiar contraseña (usuario autenticado) *(nueva)*

**Como** cualquier usuario autenticado, **quiero** poder cambiar mi contraseña
**para** dejar de usar la contraseña generada automáticamente si lo prefiero.

**Descubierta al probar HU-02b**: como la contraseña inicial la genera el
sistema (compleja, no elegida por el cliente), es razonable que quiera
cambiarla por una que recuerde más fácil.

**Criterios de aceptación (borrador):**
1. Given que el usuario está autenticado, When accede a "Cambiar contraseña"
   e ingresa su contraseña actual y una nueva que cumpla los requisitos
   mínimos, Then el sistema actualiza la contraseña en Supabase Auth.

**Estado:** ⬜ No iniciado.

---

## HU-02d — Restablecer contraseña olvidada *(nueva)*

**Como** usuario que olvidó su contraseña, **quiero** poder restablecerla sin
depender del entrenador **para** recuperar acceso a mi cuenta de forma
autónoma.

**Descubierta al probar HU-02b**: la contraseña generada es compleja
(10 caracteres aleatorios) — es razonable esperar que algunos clientes la
olviden con el tiempo.

**Criterios de aceptación (borrador):**
1. Given que el usuario olvidó su contraseña, When solicita "Olvidé mi
   contraseña" desde `/login` e ingresa su email, Then el sistema envía un
   link de restablecimiento (usa el flujo nativo de Supabase Auth,
   `resetPasswordForEmail`).

**Nota técnica:** este flujo sí requiere que el envío de correos esté
configurado en Supabase (a diferencia del registro por invitación que
descartamos, este es más simple porque Supabase Auth ya incluye plantillas
de email por defecto — no necesita infraestructura propia de correo
transaccional).

**Estado:** ⬜ No iniciado.

---

## HU-03 — Login del cliente

**Como** cliente, **quiero** iniciar sesión **para** ingresar a la plataforma.

Comparte flujo y criterios con HU-01; la única salvedad es el rol resultante.

**Estado:** ✅ Completado — cubierta por la misma implementación de HU-01
(`AuthService.login` no distingue rol al autenticar, el redirect sí varía según
`User.rol`). Ver `Progress.md` → HU-01 para el detalle de archivos y pruebas.

---

## HU-04 — Agenda de valoraciones

> **Nota de alcance (decidida al planificar Sprint 2):** el documento original
> tiene una contradicción — `1.2.2.1` no incluye "Agenda de valoraciones" en el
> MVP, pero `1.2.2.2` la excluye explícitamente, mientras que la tabla MoSCoW
> (`3.1`) la marca como `Must`. Se decide **priorizarla en el MVP** porque el
> entrenador ya agenda valoraciones verbalmente con sus clientes — automatizar
> esto desde el inicio entrega valor real inmediato, en vez de mantener un
> proceso manual que la plataforma ya podría resolver.

> **Duración estándar de valoración (confirmada con el entrenador):** la
> valoración real toma ~10 minutos, pero se define la duración estándar del
> sistema en **15 minutos** — colchón intencional de 5 minutos para absorber
> imprevistos (retrasos del cliente, mediciones que toman más tiempo) sin que
> se acumule atraso en las citas siguientes del día.

> **Pendiente técnico para HU-05:** `CitaAgenda` se migra sin relación hacia
> `Valoracion` (ese modelo aún no existe, sus campos dependen de confirmación
> pendiente con el entrenador). Cuando se implemente HU-05, agregar
> `valoracion Valoracion?` a `CitaAgenda` y el lado inverso correspondiente,
> requiriendo una migración adicional.

**Estado:** ✅ Completado — vista de calendario semanal con horario real del
entrenador (incluye hueco de almuerzo y horario distinto de sábado), modal
para agendar/reagendar/cancelar, y conexión verificada con HU-05 (registrar
valoración desde una cita la marca como `realizada`). Todo verificado en
navegador contra Supabase real.

---

## HU-05 — Registro de valoración física

> **Modelo de datos confirmado con el entrenador (revisando su Excel real):**
> los pliegues se registran en mm (9 en total: los 7 oficiales de Jackson &
> Pollock — Pectoral, Axilar medio, Tríceps, Subescapular, Abdominal,
> Suprailiaco, Muslo — más Bicipital y Pantorrilla, que se registran pero no
> entran en la fórmula). Las medidas en cm incluyen 7 pares izquierda/derecha
> (brazo, antebrazo, pierna alta, pierna, pierna baja, pantorrilla) —
> confirmado explícitamente con el entrenador, incluyendo la corrección de
> pantorrilla (que inicialmente se modeló como un solo campo).

> **Snapshot vs. recalcular (decisión de arquitectura):** los valores
> calculados (% grasa, masa grasa, IMC, calorías, etc.) se guardan en el
> momento de la valoración, no se recalculan al consultar el historial —
> una valoración es una "fotografía" de un momento específico. Si el
> entrenador edita una valoración puntual (corrige un dato mal digitado),
> ahí sí se recalcula esa valoración específica, sin afectar las demás.

> **Altura como campo de `Valoracion`, no de `Cliente`:** puede cambiar con
> el tiempo (especialmente en clientes menores de edad) — se guarda como
> snapshot en cada valoración. Es obligatoria en la primera valoración de
> un cliente; en las siguientes, el sistema la sugiere con el valor de la
> última valoración registrada (el entrenador puede editarla).

> **Punto crítico (medida extra opcional):** dos campos separados
> (`puntoCriticoNombre` + `puntoCriticoMedida`), en vez de texto libre
> combinado — decisión para poder sacar cálculos/analítica sobre esos
> puntos en el futuro sin tener que parsear texto.

> **Validación de fórmulas contra datos reales:** el "ejemplo práctico" de
> la imagen de referencia (Jackson & Pollock, hombre 30 años, 80kg,
> Σ7=100mm) no coincidía exactamente con el cálculo de precisión completa
> (diferencia de redondeo intermedio en el documento de referencia). Se
> validó la fórmula, en cambio, contra un caso **real** del Excel del
> entrenador (Σ7=178mm, edad=27, peso=98.15kg), donde el %grasa calculado
> (24.04%) coincide exactamente con el que Juan Pablo ya había calculado
> a mano — mayor confianza que un ejemplo ilustrativo.

**Estado:** ✅ Completado — modelo migrado, fórmulas validadas contra datos
reales del entrenador y contra un cliente real en el navegador (con dos bugs
de UX corregidos en el proceso: label ambiguo de fecha, desfase de zona
horaria). Pendiente único: verificar que una valoración creada desde una
`CitaAgenda` marca la cita como `realizada` — se prueba junto con el cierre
de HU-04, cuando exista la UI de calendario para generar ese flujo completo.

---

## HU-06 — Subida de 4 fotos por valoración

**Estado:** ✅ Completado (parcial) — flujo completo de subida funcional y
verificado: bucket privado en Supabase Storage con políticas RLS básicas,
previsualización antes de confirmar, subida conjunta de las 4 fotos,
reemplazo automático vía `upsert` (mismo ángulo = actualiza, no duplica).
**Pendiente:** mostrar las fotos ya subidas en algún lugar de la aplicación
(ej. en el historial de HU-07) — hoy solo se pueden subir, no visualizar
de vuelta.

---

## HU-07 — Informe de valoraciones (entrenador)

> **Alcance para el MVP (decidido al priorizar):** se implementa la vista de
> historial como tabla cronológica de valoraciones (fecha, peso, % grasa,
> IMC, y demás métricas calculadas) — sin gráficas de evolución todavía.
> Las gráficas visuales quedan documentadas como mejora post-MVP: son un
> complemento de presentación, no bloquean el objetivo central de HU-07
> (poder consultar lo que ya se registró), que sí es indispensable con el
> tiempo disponible.

**Estado:** ✅ Completado — historial de valoraciones en tabla (sin gráficas,
según lo decidido), con capa de autorización real construida por primera vez
en este proyecto (`assertClienteDelEntrenador`), y filtro de búsqueda de
clientes. Verificado en navegador, incluyendo el caso de seguridad (acceso
con ID inexistente/ajeno → 404).

---

## HU-10 — Creación de plan de entrenamiento

> **Modelo confirmado con el entrenador (revisando su Excel real de seguimiento):**
> el plan de entrenamiento tiene 4 niveles, no 2 como se pensaba originalmente:
> `PlanEntrenamiento` (macrociclo de 12 semanas) → `Microciclo` (12 por macrociclo,
> ~4 semanas entre valoraciones) → `SesionEntrenamiento` → `Ejercicio` (con series,
> repeticiones sugeridas, descanso, RIR, tomado de `EjercicioBiblioteca`).
> `EjercicioBiblioteca` requiere `CategoriaEjercicio` como tabla (no enum) — se
> confirmaron 20 categorías reales y específicas (AISLAMIENTO ISQUIOS, TRACCIÓN
> VERTICAL, etc.), con espacio para crecer.

> **Alcance para hoy (decidido al priorizar):** se construye hasta `Ejercicio`
> (la plantilla que define el entrenador). `RegistroSerie` (lo que el cliente
> ejecuta) queda pospuesto junto con HU-11/HU-12 — mismo criterio que HU-09:
> el sistema todavía no tiene un flujo real para el cliente, construir el registro
> de series sin nada más del lado cliente no se podría probar de punta a punta.

**Estado:** ✅ Completado — flujo completo verificado en navegador con datos
reales del Excel de Juan Pablo: catálogo (categorías + biblioteca de
ejercicios), macrociclo, microciclo, sesión, y ejercicio, todos encadenados.
Combobox filtrable con cascada categoría → ejercicio agregado por sugerencia
del entrenador, previendo el catálogo real completo (20+ categorías).
`RegistroSerie` migrado (esquema listo) pero sin lógica de negocio —
pospuesto para HU-11/HU-12, mismo criterio que HU-09.

---

## HU-10b — Control diario del cliente *(nueva)*

**Como** cliente, **quiero** registrar diariamente mi peso, pasos, horas de sueño,
calidad de sueño y si cumplí con la dieta **para** que mi entrenador pueda hacer
seguimiento de mi progreso día a día.

**Descubierta al revisar el Excel real de seguimiento del entrenador** (hoja
`CONTROL`), simplificada respecto a la hoja original (que tiene más campos:
RENDIMIENTO, MOTIVACIÓN, HAMBRE, CANSANCIO, ESTRÉS — descartados por decisión
del entrenador, no se necesitan para el MVP).

**Criterios de aceptación (borrador):**
1. Given que el cliente está autenticado, When accede a "Registrar control diario"
   e ingresa fecha, peso, pasos, horas de sueño, calidad de sueño, y si cumplió
   con la dieta (sí/no), Then el sistema guarda el registro.
2. Given que ya existe un registro para esa fecha, When el cliente intenta
   registrar de nuevo, Then el sistema [pendiente definir: actualiza o rechaza].

**Estado:** ⬜ No iniciado — requiere flujo real del cliente (mismo bloqueo
que HU-09/HU-11/HU-12).

---

## HU-10c — Test pre/post entrenamiento por sesión *(nueva, fuera del MVP)*

**Como** cliente, **quiero** registrar mi nivel de recuperación antes de entrenar
y la duración/dificultad de la sesión después **para** que mi entrenador ajuste
la carga según cómo me sentí.

**Descartada del MVP:** descubierta al revisar el Excel real, el entrenador
confirmó que no es indispensable para esta fase.

**Estado:** ⬜ No iniciado — fuera del MVP, documentada para una fase futura.

---

## HU-10d — Coach View: tonelaje y 1RM estimado *(nueva, fuera del MVP)*

**Como** entrenador, **quiero** ver el tonelaje total y el 1RM estimado por
ejercicio (y por categoría) en cada microciclo **para** evaluar objetivamente
el progreso de fuerza del cliente.

**Fórmulas confirmadas revisando el Excel real (no requieren datos nuevos,
se calculan sobre `RegistroSerie` ya planeado):**

```
TON TOTAL = Σ(carga_serie × reps_serie) de las series de un ejercicio
1RM ESTIMADO = carga_serie1 × (1 + 0.033 × (reps_serie1 + RIR_serie1))
```

**Descartada del MVP:** el entrenador confirmó que no es indispensable ahora —
es un reporte calculado, se puede construir después sin afectar el resto.

**Estado:** ⬜ No iniciado — fuera del MVP, documentada para una fase futura.

---

## HU-11 a HU-20

Sin cambios de contenido respecto al documento principal
(`Documentación_Proyecto_Integrador_II`, sección 3.2), salvo la corrección ya aplicada
en HU-19/HU-20: **solo la creación de un nuevo plan dispara notificación; las
ediciones de un plan vigente no notifican.** Ver ese documento para el detalle
completo de los criterios Given/When/Then de cada una — no se duplican aquí para
evitar que este archivo y el documento fuente diverjan.

**Estado de todas:** ⬜ No iniciado (planificadas para Sprints 2 a 5, según
`5.2. Sprint BackLog con tareas` del documento principal).

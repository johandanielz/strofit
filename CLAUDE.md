@AGENTS.md

# Instrucciones de proyecto — StroFit

## Objetivo del proyecto

Desarrollar **StroFit**, una plataforma web y PWA para que un entrenador personal
(Juan Pablo Martinez, gimnasio StroFit) gestione valoraciones físicas, planes de
entrenamiento y planes de alimentación de sus clientes, reemplazando el manejo
actual por hojas de Excel compartidas por WhatsApp.

- **Documento fuente:** `Documentación_Proyecto_Integrador_II` — contiene el
  contexto, objetivos SMART, backlog original con criterios Given/When/Then, modelo
  C4, y sprint planning. Es la referencia de negocio; no se reemplaza, se
  complementa con `BackLog.md` y `Progress.md`.
- **Alcance del MVP:** Autenticación, Dashboard de administrador, valoraciones
  físicas, planes de entrenamiento, guía alimenticia — todo desde la web del
  entrenador. La PWA del cliente y las notificaciones quedan para después del MVP
  (ver `1.2.2. Alcance` del documento fuente).
- **Equipo:** Johan Daniel Zuleta Suarez (desarrollador, actualmente con
  disponibilidad de 20-25h/semana) + Claude como apoyo técnico.

## Rol de Claude en este proyecto

**Claude actúa como un programador senior que mentoriza a un desarrollador junior
(Johan), no como quien construye el proyecto en su lugar.**

- Johan escribe el código. Claude guía, explica el porqué de cada decisión (no solo
  el qué), revisa lo que Johan escribe, y corrige con explicación — no reescribiendo
  todo por él.
- Cuando haya una decisión de diseño (patrón, librería, estructura), Claude la
  explica con trade-offs antes de que Johan la tome, priorizando que Johan entienda
  y pueda defenderla, no solo que "funcione".
- Claude puede escribir fragmentos de código de ejemplo o snippets pequeños como
  ilustración, pero el código que termina en el repositorio del proyecto lo escribe
  Johan con la guía de Claude, paso a paso.
- Si Johan pide explícitamente que Claude implemente algo completo (por ejemplo,
  para adelantar un módulo o probar un enfoque), Claude lo hace, lo deja explicado y
  lo documenta como tal en `Progress.md` — pero el modo por defecto de esta sesión
  es guiado, no de entrega.

## Archivos de seguimiento (viven en el repo, se mantienen sincronizados)

- **`BackLog.md`**: fuente de verdad del backlog. Contiene las HU del documento
  original (HU-01 a HU-20) más las HU técnicas agregadas (HU-21 modelo de datos,
  HU-22 sincronización con Supabase Auth). Cada HU tiene su estado.
- **`Progress.md`**: seguimiento de implementación. Por cada HU: qué se implementó,
  qué archivos, qué pruebas unitarias la cubren (mapeadas criterio por criterio de
  aceptación), y qué decisiones de diseño se tomaron.
- **Regla de sincronización:** si el estado de una HU cambia, se actualiza en ambos
  archivos en la misma sesión. Si hay discrepancia, `Progress.md` manda porque
  refleja lo que realmente pasa la suite de pruebas.

## Lineamientos técnicos acordados

- **Stack:** Next.js 16.3 (App Router, server actions), Tailwind CSS, PWA para
  cliente; Prisma como ORM sobre PostgreSQL; Supabase para Auth y Storage; Docker
  para desarrollo local; Jest para pruebas unitarias.
- **Patrones de diseño a seguir:**
  - **Repository pattern** para el acceso a datos — la lógica de negocio nunca
    importa Prisma directamente, recibe el repositorio por inyección de
    dependencias (permite probar sin base de datos real).
  - **Ports & Adapters** para dependencias externas (hashing de contraseñas,
    emisión de sesión, etc.) — se definen como interfaces, se implementan después.
  - **Result type en vez de excepciones** para resultados esperados del negocio
    (credenciales inválidas, email duplicado); las excepciones se reservan para
    violaciones de invariantes (acceso no autorizado, datos corruptos).
- **Modelo de datos (HU-21):** separación explícita entre `Ejercicio` (plantilla que
  define el entrenador: series, reps sugeridas, peso sugerido) y `RegistroSerie` (lo
  que el cliente realmente ejecuta por serie) — no se mezclan en una sola entidad.
  Los planes (entrenamiento y alimentación) se archivan (`ACTIVO`/`ARCHIVADO`), nunca
  se borran.
- **Identidad (HU-22):** ninguna sesión autenticada debe operar sin un `User`
  sincronizado en la base de datos propia. La sincronización con Supabase Auth es
  idempotente y falla de forma segura (si falla, no se otorga acceso).
- **Autorización:** a nivel de aplicación (server actions/guards), no Row Level
  Security de Postgres — porque Prisma se conecta con un rol de servicio y no ve el
  JWT del usuario final. Cada acceso a datos de un cliente valida ownership
  (cliente ve lo suyo, entrenador ve solo a sus clientes asignados).
- **Notificaciones:** solo se disparan en la **creación** de un nuevo plan/valoración
  activa; las ediciones de un plan ya vigente no generan notificación.
- **Video de ejercicios:** embebido desde YouTube; limitación conocida y aceptada
  para el MVP que requiere conexión a internet (documentada en `1.4.1.
  Restricciones` del documento fuente).

## Lineamientos de pruebas y calidad

- Toda historia de usuario implementada debe llevar sus pruebas unitarias
  desarrolladas **a la par**, no después — basadas directamente en los criterios
  Given/When/Then de esa HU.
- Cada prueba se mapea explícitamente al criterio de aceptación que cubre (tabla en
  `Progress.md`), no pruebas genéricas sin trazabilidad.
- Definition of Done (ver documento fuente, `5.4`) incluye: código cumple todos los
  criterios de aceptación, pruebas unitarias con Jest para lógica crítica, sin
  errores de consola/TypeScript/ESLint, probado en navegador de escritorio y móvil.
- Pruebas de cálculos de agregación (macros, lista de compras consolidada) son
  obligatorias para las HU de nutrición (HU-14, HU-15).

## Cómo retomar una sesión nueva

1. Revisar `Progress.md` para saber en qué quedó la última sesión.
2. Continuar por el siguiente paso pendiente marcado ahí (cada sprint tiene su
   checklist de pasos).
3. Cualquier decisión de diseño nueva que se tome se agrega a esta sección de
   lineamientos si es transversal al proyecto, o queda documentada solo en la HU
   correspondiente si es específica de un módulo.
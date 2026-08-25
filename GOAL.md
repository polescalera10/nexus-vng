> **DOCUMENTO HISTÓRICO — no es la especificación vigente.**
>
> Este es el brief original del MVP (julio 2026), escrito bajo la marca antigua
> "Aranha Baile". Se conserva tal cual porque explica **por qué** el modelo de
> datos es como es (roles leader/follower, cursos por ciclos, sin pasarela de
> pagos), pero ya no describe el estado del proyecto.
>
> **Dónde está el estado real:**
> - `README.md` — rutas, roles, scripts, estructura y convenciones vigentes.
> - `CLAUDE.md` (carpeta del proyecto) — contexto y reglas de trabajo.
> - `MEMORY.md` (carpeta del proyecto) — historial de decisiones y avances.
> - `docs/informe-repo-2026-08-25.md` — último informe de repo y BD.
>
> **Qué ha cambiado respecto a este brief (25-08-2026):**
> - El proyecto se renombró a **NEXUS VNG** (nexusvng.es, @nexusvng), identidad dark neón.
> - El rol `alumno` **ya no es roadmap**: tiene login y panel propio.
> - Módulos que este brief no contemplaba y hoy existen: **leads**, **intensivos**,
>   **eventos**, **gamificación por puntos y premios**, y **conversión de lead a alumno**.
> - Las 30 landings de campaña por dolor de ICP (`/l/[icp]/[dolor]`) son posteriores.
> - Del § 7 (roadmap) ya están hechos: login de alumno y eventos sociales.
>   Siguen sin hacer: recuperación de clases, vídeos por curso y progresión de nivel
>   con validación del profe.

# /goal — Aranha Baile: App de gestión de escuela de baile (MVP)

Pega este bloque completo tras `/goal` en Claude Code (modelo Fable 5). Está escrito para que orquestes subagentes por fases. Léelo entero antes de tocar nada.

## 0. CONTEXTO DEL PROYECTO

Estoy construyendo Aranha Baile, una escuela de salsa cubana y bachata en Vilanova i la Geltrú (co-ubicada dentro de otra escuela, Coda). Necesito una app de gestión interna para administrar alumnos, cursos, profesores, asistencia y comunicación por WhatsApp.

**Nota importante:** este repo (`aranha-baile`) ya contiene la web pública de la escuela, construida en Next.js 15 + Supabase, con una carpeta `src/app/area-privada/` que ya prevé login y paneles por rol (alumno · profesor · admin). Antes de proponer estructura nueva, audita lo que ya existe en el repo (código, migraciones de Supabase, tipos) y reutilízalo/extiéndelo en vez de duplicarlo.

Referencia de mercado: existe una app llamada MAAT (maatapp.com) hecha para gimnasios de artes marciales (BJJ/MMA). Nos inspiramos en su modelo pero adaptado a nicho baile. La diferencia clave del baile frente a las artes marciales:

* Las clases necesitan balance de roles (leader / follower), no solo aforo total.
* Los alumnos suelen venir en pareja o buscan pareja.
* El formato es cursos por ciclos (mensual/trimestral, grupo cerrado que progresa junto) además de clases sueltas.
* La progresión es por niveles de baile (Iniciación → Básico → Intermedio → Avanzado), no cinturones.

IMPORTANTE — fuera del MVP: NO implementamos pagos (ni Stripe ni pasarela). El estado de cuota es un campo manual (pagado/pendiente) que marca el admin o el profe. La comunicación por WhatsApp sustituye toda la lógica de cobros/dunning que tendría un sistema con pagos.

## 1. OBJETIVO DEL MVP

Una app web (responsive, mobile-first) donde:

1. El admin (yo) da de alta alumnos, crea cursos, asigna profesores y ve el estado general.
2. El profesor consulta sus clases, pasa lista y ve las fichas de sus alumnos.
3. El alumno (fase posterior, ver roadmap) verá su horario y confirmará asistencia. En el MVP el alumno NO tiene login todavía; todo lo gestiona admin/profe.

El éxito del MVP se mide por: dar de alta un alumno → asignarlo a un curso → pasar lista → disparar un recordatorio de WhatsApp, con fricción cero. Ese flujo es la prioridad absoluta.

## 2. STACK TÉCNICO (obligatorio, es mi stack habitual)

* Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion para transiciones.
* Backend / DB: Supabase (Postgres + Auth + RLS). Usar Supabase JS client y Server Components / Server Actions donde tenga sentido.
* Auth: Supabase Auth. Roles: `admin`, `profesor`. (Rol `alumno` reservado para roadmap, dejar el enum preparado.)
* Automatización / WhatsApp: n8n autohospedado + WhatsApp Cloud API. La app NO llama directamente a Meta: la app dispara webhooks a n8n, y n8n gestiona plantillas y envío. Diseña la app para emitir eventos a un endpoint webhook configurable por variable de entorno.
* Deploy: Vercel.
* Gestor de paquetes: pnpm.

No introduzcas dependencias pesadas sin justificarlo. Nada de ORM extra (Prisma etc.) salvo que lo pida: usamos el cliente de Supabase directamente.

## 3. MODELO DE DATOS (Supabase / Postgres)

Genera las migraciones SQL con RLS activado. Tablas mínimas del MVP:

**`profiles`** (extiende auth.users)

* `id` uuid PK (= auth.users.id)
* `full_name` text
* `role` enum: `admin` | `profesor` | `alumno`
* `phone` text (formato E.164, para WhatsApp)
* `created_at`

**`students`**

* `id` uuid PK
* `full_name` text
* `phone` text (E.164)
* `email` text nullable
* `dance_role` enum: `leader` | `follower` | `both`
* `level` enum: `iniciacion` | `basico` | `intermedio` | `avanzado`
* `partner_id` uuid nullable (FK → students.id, autorreferencia para vincular pareja)
* `payment_status` enum: `al_dia` | `pendiente` (manual, default `pendiente`)
* `is_founding_member` boolean default false
* `notes` text (notas privadas del profe: lesiones, observaciones)
* `active` boolean default true
* `created_at`

**`teachers`**

* `id` uuid PK
* `profile_id` uuid nullable (FK → profiles.id, si el profe tiene login)
* `full_name` text
* `phone` text
* `disciplines` text[] (ej: `{'salsa','bachata'}`)
* `weekly_availability` jsonb (bloques de disponibilidad, estructura libre pero documentada)
* `active` boolean default true

**`courses`**

* `id` uuid PK
* `name` text (ej: "Salsa Básico - Martes 20h")
* `discipline` enum: `salsa` | `bachata`
* `level` enum (igual que students.level)
* `teacher_id` uuid FK → teachers.id
* `weekday` enum o smallint (0-6)
* `start_time` time
* `duration_min` int
* `capacity_leaders` int
* `capacity_followers` int
* `cycle_type` enum: `curso` (grupo cerrado por ciclo) | `suelta` (drop-in)
* `start_date` date nullable
* `end_date` date nullable
* `active` boolean default true

**`enrollments`** (alumno ↔ curso)

* `id` uuid PK
* `student_id` uuid FK → students.id
* `course_id` uuid FK → courses.id
* `role_in_course` enum: `leader` | `follower` (un alumno `both` elige rol por curso)
* `status` enum: `activo` | `baja` | `lista_espera`
* `enrolled_at`
* constraint: no exceder `capacity_leaders`/`capacity_followers` según rol → si excede, entra como `lista_espera`.

**`class_sessions`** (instancia concreta de una clase en una fecha)

* `id` uuid PK
* `course_id` uuid FK
* `session_date` date
* `status` enum: `programada` | `impartida` | `cancelada`
* `substitute_teacher_id` uuid nullable (FK → teachers.id, si hubo sustitución)
* generación: crea sesiones a partir del horario del curso (job o al vuelo, tú decides lo más simple).

**`attendance`**

* `id` uuid PK
* `class_session_id` uuid FK
* `student_id` uuid FK
* `present` boolean
* `recorded_by` uuid FK → profiles.id
* `recorded_at`

**`whatsapp_events`** (cola/log de mensajes emitidos)

* `id` uuid PK
* `student_id` uuid FK nullable
* `type` enum: `recordatorio_clase` | `cuota_pendiente` | `alumno_inactivo` | `confirmacion_lista_espera` | `broadcast`
* `payload` jsonb (datos que n8n necesita para renderizar la plantilla)
* `status` enum: `pendiente` | `enviado` | `error`
* `sent_at` nullable
* `created_at`

RLS: admin ve todo. Profesor ve solo sus cursos, sus sesiones, sus alumnos matriculados y puede escribir asistencia de sus sesiones. Documenta cada policy.

## 4. FUNCIONALIDADES POR MÓDULO

**Módulo 1 — Alumnos**

* CRUD de alumnos con todos los campos.
* Vincular pareja (selector de otro alumno; al vincular, actualizar ambos lados).
* Marcar estado de cuota manual (al_dia / pendiente) con un toggle rápido desde la lista.
* Filtros: por nivel, por rol, por estado de cuota, por curso, activos/inactivos.
* Vista ficha: datos + cursos en los que está + % asistencia + notas privadas.

**Módulo 2 — Cursos y clases**

* CRUD de cursos con aforo separado por rol (leaders / followers).
* Al matricular a un alumno: validar aforo del rol; si está lleno, ofrecer lista de espera.
* Vista de curso: lista de matriculados separada en dos columnas (leaders | followers) con contador de balance (ej: "8 leaders / 6 followers — faltan 2 followers").
* Generación de `class_sessions` según el horario semanal.

**Módulo 3 — Profesores**

* CRUD de profesores: disciplinas, disponibilidad semanal.
* Asignación a cursos.
* Sustituciones: en una `class_session` concreta, asignar profe sustituto → esto debe disparar evento WhatsApp al sustituto (payload con fecha/curso).
* Registro de horas: vista que suma sesiones `impartida` por profe/mes (solo lectura/informe, no calcula pagos).

**Módulo 4 — Asistencia**

* Vista "pasar lista" para el profe: seleccionar una `class_session` de hoy → lista de alumnos matriculados con toggle presente/ausente → guardar.
* Al guardar, marcar la sesión como `impartida`.
* Debe ser rapidísimo en móvil (el profe pasa lista con una mano). Prioriza UX aquí.
* Ausencias alimentan la detección de alumno inactivo (módulo 5).

**Módulo 5 — WhatsApp (núcleo de comunicación)**

La app NO envía mensajes: crea filas en `whatsapp_events` y/o hace POST a un webhook de n8n (`N8N_WEBHOOK_URL` en env). Implementa las dos vías: escribe en la tabla como log y dispara el webhook.

Eventos a emitir:

* `recordatorio_clase`: día antes de cada sesión programada (dispara un job diario o un endpoint que n8n llama por cron; la lógica de "qué alumnos" vive en la app, el envío en n8n).
* `cuota_pendiente`: al marcar un alumno como `pendiente`, ofrecer botón "avisar por WhatsApp".
* `alumno_inactivo`: detectar alumnos activos sin asistencia en 2+ semanas → lista revisable + botón para disparar aviso.
* `confirmacion_lista_espera`: cuando se libera plaza en un curso y un alumno pasa de `lista_espera` a `activo`.
* `broadcast`: enviar mensaje a todos los alumnos de un curso/nivel (cambio de horario, evento social).

Cada evento construye un `payload` jsonb con lo que n8n necesita (nombre, teléfono, curso, fecha, texto). Documenta el contrato del payload por tipo de evento en un archivo `docs/whatsapp-contracts.md` para que yo configure n8n.

## 5. ARQUITECTURA Y CONVENCIONES

* App Router con grupos de rutas: `(auth)`, `(dashboard)`. Layout de dashboard con navegación lateral.
* Server Components por defecto; Server Actions para mutaciones; Client Components solo donde haya interactividad (toggles, formularios, pasar lista).
* Carpeta `lib/supabase/` con clientes server y browser separados.
* `types/` con tipos generados de Supabase (`supabase gen types typescript`).
* Validación con Zod en los Server Actions.
* Componentes UI reutilizables en `components/ui/`.
* Nada de localStorage/sessionStorage.
* Mobile-first siempre. El profe usa el móvil, el admin usa desktop.
* Estética: limpia, moderna, cálida (marca anti-pretenciosa, cercana). Framer Motion sutil, sin excesos. Paleta pendiente de definir → usa tokens neutros + un acento configurable en `tailwind.config`.

## 6. ORQUESTACIÓN CON SUBAGENTES

Ejecuta por fases. Al terminar cada fase, para y muéstrame un resumen antes de seguir (checkpoint de validación). Usa subagentes especializados en paralelo donde no haya dependencias.

**Fase 0 — Descubrimiento (sin escribir código)**

Un subagente audita el repo actual (si existe), confirma versiones del stack, y produce un plan detallado + estructura de carpetas propuesta. No toques código. Espera mi OK.

**Fase 1 — Fundación**

* Subagente A: scaffolding Next.js + Tailwind + Framer Motion + estructura de carpetas.
* Subagente B: setup Supabase (migraciones SQL con todas las tablas + enums + RLS + seed de datos de prueba).
* Subagente C: Auth (login admin/profe, middleware de protección de rutas, layout dashboard).

Al acabar: la app arranca, puedo loguearme, la DB está migrada con datos seed.

**Fase 2 — Módulos core (paralelizable)**

* Subagente Alumnos: módulo 1 completo.
* Subagente Cursos: módulo 2 completo (incluye lógica de aforo por rol + lista de espera).
* Subagente Profesores: módulo 3 completo.

Cada uno con sus Server Actions, validación Zod y UI. Coordina para que compartan los componentes `ui/`.

**Fase 3 — Asistencia + WhatsApp**

* Subagente Asistencia: módulo 4 (optimizado para móvil).
* Subagente WhatsApp: módulo 5 (tabla de eventos, webhooks a n8n, detección de inactivos, `docs/whatsapp-contracts.md`).

**Fase 4 — Pulido**

* Revisión de RLS (un subagente intenta romper permisos de profesor).
* Estados vacíos, loading, errores.
* README con setup local, variables de entorno y cómo conectar n8n.

**Reglas para subagentes:**

* Cada subagente documenta lo que hizo en un resumen corto al terminar.
* Si un subagente detecta que necesita una decisión de producto (no técnica), que pare y me pregunte a través de ti.
* No dupliquéis lógica: tipos y helpers compartidos en `lib/` y `types/`.

## 7. ROADMAP (NO implementar ahora, solo dejar preparado)

Deja el modelo de datos y los enums preparados para, más adelante:

* Login de alumno (rol `alumno` ya en el enum) + auto-reserva desde su móvil.
* Recuperación de clases entre grupos del mismo nivel.
* Eventos sociales (prácticas, fiestas Feeling) con RSVP e invitados no-alumnos.
* Vídeos de la figura de la semana por curso.
* Programa Founding Member con lógica de precio bloqueado (el flag `is_founding_member` ya existe).
* Progresión de nivel con validación del profe (histórico de promociones).

No construyas nada de esto. Solo asegúrate de que las decisiones del MVP no cierren estas puertas.

## 8. ENTREGABLES ESPERADOS

1. Repo Next.js funcionando en local con `pnpm dev`.
2. Migraciones SQL aplicables en Supabase + seed.
3. Los 5 módulos operativos según spec.
4. `docs/whatsapp-contracts.md` con el contrato de payloads para n8n.
5. `README.md` con setup, env vars y guía de conexión n8n.
6. `.env.example` completo.

Empieza por la Fase 0 y espera mi validación antes de escribir código.

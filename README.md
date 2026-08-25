# NEXUS VNG

Dos aplicaciones en un mismo repo Next.js:

- **Web pública** — landing y páginas SEO de la escuela de baile NEXUS VNG (salsa cubana, bachata y más) en Vilanova i la Geltrú. Objetivo nº1: convertir visitas en mensajes de WhatsApp.
- **Panel interno** (`/area-privada`) — gestión de la escuela con tres perfiles (admin · profesor · alumno): leads, alumnos, cursos con aforo separado leader/follower y lista de espera, profesores, intensivos, eventos, gamificación por puntos, pasar lista desde el móvil y comunicación por WhatsApp vía n8n.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript estricto) |
| Estilos | Tailwind CSS v4 — design tokens en `src/app/globals.css` (`@theme`) |
| Backend / Auth | Supabase (Postgres + Auth + RLS) via `@supabase/ssr` |
| Validación | Zod + Server Actions |
| Animación | CSS + IntersectionObserver (respeta `prefers-reduced-motion`). **Framer Motion se retiró el 15-08-2026**: eran 110 KB solo para animaciones de entrada. |
| Tests | Vitest + Testing Library (`tests/unit/`) · Playwright (`tests/e2e/`) |
| Mensajería | n8n autohospedado + WhatsApp Cloud API (la app nunca llama a Meta) |
| Paquetes | pnpm |

## Requisitos

- **Node.js** 20+ (Next 15 exige ≥ 18.18)
- **pnpm** 10 (el repo fija `pnpm@10.33.0` en `packageManager`)
- **Docker Desktop** + **Supabase CLI** — para la base de datos local (`supabase start` levanta Postgres, Auth y Studio en contenedores)

## Setup local desde cero

```bash
git clone <url-del-repo> && cd nexus-vng
pnpm install
cp .env.example .env.local
supabase start        # levanta la BD local; imprime URL y claves
pnpm db:reset         # aplica migraciones 0001-0030 + supabase/seed.sql
pnpm dev              # http://localhost:3000
```

La web pública compila y se ve **sin Supabase**: las modalidades caen a un fallback estático (`src/content/landing.ts`) si faltan las variables. El panel interno sí necesita la BD.

> ⚠️ **El `.env.local` que hay en la máquina de Pol tiene credenciales de relleno**
> (`https://dummy-project.supabase.co`) y `NEXT_PUBLIC_SITE_URL` apunta al dominio
> antiguo. Con esos valores **el panel entero se ve vacío en local aunque funcione en
> producción**, porque toda consulta falla y cae al fallback — es muy fácil confundirlo
> con un bug. Para trabajar contra datos reales: `vercel env pull .env.local`.

### Variables de entorno (`.env.local`)

| Variable | Ámbito | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | público | URL del proyecto Supabase. En local, la "API URL" que imprime `supabase start` (`http://127.0.0.1:54321`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público | Anon key. En local, la que imprime `supabase start`. |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** | Service role — salta RLS. La usan la ruta cron y queries de admin. Nunca prefijarla con `NEXT_PUBLIC_`. |
| `N8N_WEBHOOK_URL` | **solo servidor** | Webhook de n8n que recibe leads del formulario público y todos los eventos WhatsApp del panel. Si falta, la app lo avisa por consola y omite el POST (no rompe nada). |
| `CRON_SECRET` | **solo servidor** | Secreto compartido de las rutas cron. `cronRequestIsAuthorized` acepta las dos formas: `Authorization: Bearer $CRON_SECRET` (lo que manda Vercel Cron por su cuenta) y `x-cron-secret: $CRON_SECRET` (lo que manda n8n). Comparación en tiempo constante. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | público | Teléfono de WhatsApp de la escuela, internacional sin `+` ni espacios (ej: `34600000000`). CTA de la web pública. |
| `NEXT_PUBLIC_SITE_URL` | público | URL canónica (metadata, sitemap, OpenGraph). |

### Crear el primer admin

No hay registro público: `/area-privada` solo tiene login (email + contraseña). El primer usuario se crea a mano:

1. Abre Supabase Studio (local: `http://localhost:54323`) → **Authentication → Add user** → crea el usuario con email confirmado y contraseña.
2. Un trigger crea automáticamente su fila en `profiles` con `role = 'alumno'`.
3. En **Table Editor → profiles**, cambia su `role` a `admin`.
4. Entra en `http://localhost:3000/area-privada` — el middleware te redirige a `/area-privada/admin`.

**A partir de ahí, los accesos se dan desde el panel.** En la ficha de un profesor o de
un alumno hay un botón **"Crear acceso al panel"** (`src/lib/actions/access.ts`): crea el
usuario de Auth con su email, le pone el rol y lo enlaza a la ficha. **No envía ningún
correo** — la persona entra en `/area-privada` y pide su propio enlace mágico. Un clic del
admin no debería disparar un email a un tercero.

Necesita `SUPABASE_SERVICE_ROLE_KEY`: crear usuarios y asignar roles son operaciones que la
RLS no permite (ni debe permitir) a la sesión del admin.

### Tipos de la BD

`src/types/database.ts` está **escrito a mano** espejando las migraciones (exporta tipos con nombre: `Student`, `Course`, `WhatsappEventType`…). Existe `pnpm db:types`, que **sobrescribe** ese archivo con el formato generado por `supabase gen types` (interfaz `Database`), distinto del que consume el código. Si cambias el esquema, lo normal es actualizar los tipos a mano junto con la migración; usa `db:types` solo si vas a migrar el proyecto al formato generado.

## Panel interno

### Rutas y roles

| Ruta | Rol | Qué es |
|---|---|---|
| `/area-privada` | — | Login (contraseña o enlace mágico). Redirige por rol tras autenticar. |
| `/area-privada/admin` | admin | Novedades: feed de actividad y accesos rápidos. |
| `/area-privada/admin/leads` | admin | Bandeja de leads de los formularios. Cada uno se puede **convertir en alumno** (`/[id]/convertir`). |
| `/area-privada/admin/intensivos` | admin | Asistencia y cobro por sesión de intensivo, pensado para el móvil. |
| `/area-privada/admin/alumnos` | admin | Lista con filtros + alta (`/nuevo`), ficha (`/[id]`), edición (`/[id]/editar`) e inactivos (`/inactivos`: sin asistencia en 14 días). La ficha incluye puntos y acceso al panel. |
| `/area-privada/admin/cursos` | admin | CRUD de cursos, aforo leader/follower, matrículas, lista de espera y sesiones. |
| `/area-privada/admin/profesores` | admin | CRUD de profesores, disciplinas, disponibilidad, cursos asignados y horas impartidas. |
| `/area-privada/admin/eventos` | admin | CRUD de eventos (borrador / publicado). Lo publicado sale en `/eventos`. |
| `/area-privada/admin/gamificacion` | admin | Ranking, canjes pendientes, catálogo de `/premios` y de `/reglas`. |
| `/area-privada/admin/whatsapp` | admin | Log de `whatsapp_events` + composer de broadcast por curso o nivel. |
| `/area-privada/profesor` | profesor | "Hoy": agenda de sesiones del día con acceso directo a pasar lista. |
| `/area-privada/profesor/asistencia/[sessionId]` | profesor | Pasar lista (mobile-first): toggles presente/ausente; al guardar, la sesión pasa a `impartida`. |
| `/area-privada/profesor/cursos` | profesor | Mis cursos y sus alumnos (`/alumnos/[id]` para la ficha). |
| `/area-privada/alumno` | alumno | Su saldo de puntos, movimientos, sus clases, premios canjeables y estado de sus canjes. |

`middleware.ts` refresca la sesión y protege `/area-privada/**`. **RLS respalda todo**: el
admin ve todo; el profesor solo sus cursos, sesiones (incluidas sustituciones), matrículas,
asistencia y las fichas de sus alumnos; el alumno solo lo suyo
(`supabase/migrations/0019_rls_dashboard.sql`, `0020_rls_hardening.sql`,
`0026_area_privada_alumno.sql`).

**La barra de pestañas móvil enseña 4 secciones y esconde el resto detrás de "Más"**: nueve
pestañas no caben a 320px sin bajar de los 44px de objetivo táctil. Cubierto en
`tests/unit/dashboard-tabbar.test.tsx`.

### Flujo de la métrica de éxito

1. **Llega un lead** — formulario de la web → fila en `leads` + webhook a n8n.
2. **Convertirlo en alumno** — botón "Convertir a alumno" en la bandeja de leads. Solo hace falta nombre, teléfono y email; el resto (cumpleaños, nivel, pareja) se pide después desde su ficha. Se puede matricular de camino, y **el lead se conserva enlazado** (`leads.student_id`) para no perder qué campaña lo trajo.
3. **Matricular en un curso** — desde el detalle del curso o durante la conversión, eligiendo rol leader/follower. Si el aforo de ese rol está lleno, entra en `lista_espera`; al promoverlo se dispara `confirmacion_lista_espera` por WhatsApp.
4. **Pasar lista** — el profesor abre `/area-privada/profesor`, toca la sesión de hoy y marca presentes. Guardar marca la sesión como `impartida` y alimenta la detección de inactivos.
5. **Recordatorio WhatsApp** — el cron diario genera las sesiones de mañana y despacha un `recordatorio_clase` por alumno matriculado.
6. **Puntos y premios** — el admin le da puntos desde su ficha; el alumno los canjea desde su área privada.

## Gamificación

Los alumnos ganan puntos por venir a clase, a fiestas, a congresos o a lo que decidas, y los
canjean por premios desde su área privada.

- **`point_events` es el libro mayor** y la única fuente de verdad. **El saldo nunca se
  materializa**: es la suma de esas filas (vista `student_point_balances`, `security_invoker`).
  Un contador guardado se desincroniza en cuanto alguien corrige un apunte, y aquí corregir es
  lo normal.
- **`point_rules`** es un catálogo de atajos ("Asistir a una fiesta → 25"), editable desde
  `/area-privada/admin/gamificacion/reglas`. No aplica nada por su cuenta: el apunte lo hace
  una persona desde la ficha del alumno.
- **Las reglas duras viven en Postgres, no en la Server Action.** Saldo suficiente, stock y
  el apunte negativo del canje los aplica el trigger `reward_redemptions_apply`; el aviso al
  cruzar un hito lo aplica `point_events_check_milestones`. Con la clave publicable se puede
  escribir por REST saltándose la validación de la app — que es exactamente el agujero que
  todavía tiene el control de aforo de matrícula (ver `docs/rls-audit.md` § 4).
- Cancelar un canje **devuelve los puntos y repone el stock** (mismo trigger). Por eso los
  apuntes de tipo `canje` no se pueden borrar a mano desde la ficha.

## Integración n8n / WhatsApp

**La app nunca llama a Meta/WhatsApp.** Cada evento: (1) inserta una fila en `whatsapp_events` con `status = 'pendiente'`, (2) hace POST a `N8N_WEBHOOK_URL`, (3) 2xx → `enviado` + `sent_at`; fallo → `error`. `enviado` significa "entregado a n8n", no entrega real del mensaje. El despacho es best-effort: un fallo del webhook nunca revierte la operación de negocio (código en `src/lib/whatsapp/dispatch.ts` y `src/lib/n8n/client.ts`).

Shape del POST (común a todos los tipos):

```json
{
  "event_id": "uuid de whatsapp_events.id (clave de idempotencia)",
  "type": "recordatorio_clase | cuota_pendiente | alumno_inactivo | confirmacion_lista_espera | broadcast | cumpleanos | puntos_hito | premio_canjeado",
  "student_id": "uuid o null",
  "payload": { "…claves según el tipo…" },
  "created_at": "ISO 8601"
}
```

El contrato completo de `payload` por tipo de evento está en **`docs/whatsapp-contracts.md`** — es la referencia para montar los flujos de n8n. Ojo: el formulario público de leads hace POST a la misma URL con otro shape (sin `event_id` ni `type`); distingue ambos casos en el flujo de entrada.

**Hay un tipo que NO nace en la app.** `puntos_hito` lo crea un trigger de Postgres cuando
un alumno cruza un hito de puntos, y un trigger no puede hacer POST a n8n: la fila se queda
en `pendiente`. La vacía `flushPendingWhatsappEvents`, que llama el cron de cumpleaños en su
pasada diaria. Si ese cron se desactiva, esos avisos se acumulan sin enviarse.

### Conectar n8n

1. Crea un workflow en n8n con un nodo **Webhook** (método POST) y copia su URL de producción en `N8N_WEBHOOK_URL`.
2. En ese workflow, enruta por `type` (y por `payload.kind` dentro de `broadcast`) y envía la plantilla correspondiente por WhatsApp Cloud API. Usa `event_id` como clave de idempotencia.
3. **Cron de recordatorios**: añade un segundo workflow con nodo **Schedule** (diario, p. ej. 10:00 Europe/Madrid) que haga:

   ```
   GET https://<tu-app>/api/cron/recordatorio-clase
   Header: x-cron-secret: <CRON_SECRET>
   ```

   Sirve cualquier cron externo (no tiene por qué ser n8n). La ruta es idempotente: reejecutarla el mismo día no duplica recordatorios (responde `{ sessions, dispatched, skipped }`).

4. **Cron de cumpleaños**: este sí lo dispara **Vercel** (declarado en `vercel.json`, 08:00 UTC).
   Felicita a quien cumple años hoy **y** vacía la cola de eventos `pendiente`. Idempotente por
   partida doble: consulta antes de encolar y hay un índice único parcial en BD sobre
   `(student_id, payload->>'anio')`. Responde `{ fecha, felicitados, pendientes_despachados }`.

### Probar sin n8n

1. Abre [webhook.site](https://webhook.site) y pon su URL única como `N8N_WEBHOOK_URL` en `.env.local`.
2. Dispara cualquier acción del panel (p. ej. "Avisar por WhatsApp" en un alumno con cuota pendiente) y mira el JSON recibido.
3. Prueba el cron a mano:

   ```bash
   curl -H "x-cron-secret: tu-cron-secret" http://localhost:3000/api/cron/recordatorio-clase
   ```

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (`http://localhost:3000`). |
| `pnpm build` | Build de producción. |
| `pnpm start` | Sirve el build. |
| `pnpm lint` | ESLint (`next lint`). |
| `pnpm format` | Prettier sobre todo el repo. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm test` | Tests unitarios (Vitest, `tests/unit/`). |
| `pnpm test:e2e` | Tests e2e (Playwright, `tests/e2e/`). Levantan un **build de producción**, no `next dev`. |
| `pnpm test:all` | Los dos seguidos. |
| `pnpm db:reset` | `supabase db reset` — recrea la BD local: migraciones + seed. |
| `pnpm db:push` | `supabase db push` — empuja migraciones al proyecto Supabase vinculado. |
| `pnpm db:types` | Regenera `src/types/database.ts` desde la BD local (ver aviso en "Tipos de la BD"). |

## Estructura

```
src/
├── app/
│   ├── (public)/                    landing + páginas SEO (ISR)
│   ├── (campanas)/l/[icp]/[dolor]/  30 landings de conversión por dolor de ICP
│   ├── area-privada/
│   │   ├── page.tsx · LoginForm     login (Supabase Auth)
│   │   ├── alumno/                  área del alumno (puntos, clases, premios)
│   │   └── (dashboard)/
│   │       ├── admin/               leads · intensivos · alumnos · cursos ·
│   │       │                        profesores · eventos · gamificacion · whatsapp
│   │       └── profesor/            hoy · asistencia/[sessionId] · cursos · alumnos
│   ├── api/cron/                    keep-alive · recordatorio-clase · cumpleanos
│   └── globals.css                  TOKENS de diseño (@theme)
├── components/    campanas · forms · landing · layout · seo · ui
├── lib/
│   ├── actions/   Server Actions (students, courses, enrollments, attendance,
│   │              teachers, modalidades, eventos, gamificacion, lead-conversion,
│   │              access, intensivos, whatsapp-events, leads)
│   ├── queries/   lecturas (queries planas, composición en JS)
│   │              catalogo.ts = modalidades + niveles compartidos por el panel
│   ├── supabase/  clientes server / public / browser / service role
│   ├── n8n/       client.ts (POST al webhook)
│   ├── whatsapp/  dispatch.ts (tabla + webhook + vaciado de la cola)
│   ├── validation/  esquemas Zod, uno por dominio
│   └── auth.ts · format.ts · phone.ts · images.ts · datetime-madrid.ts · site.ts
├── content/       copy de la landing, disciplinas, horario, campañas
└── types/         database.ts (tipos a mano)
supabase/
├── migrations/    0001-0030
│                  web pública 0001-0010 · panel 0011-0020 · leads 0021-0023
│                  intensivos 0024 · catálogo 0025 · alumno 0026
│                  gamificación 0027 · eventos 0028 · conversión 0029 · RPC 0030
└── seed.sql       SOLO datos de prueba (el catálogo real vive en la 0025)
docs/
├── whatsapp-contracts.md            contrato de payloads app → n8n
├── rls-audit.md                     auditoría de las policies del panel
├── informe-repo-2026-08-25.md       último informe de repo y BD
└── auditoria-*.md · informe-seo-*   histórico de auditorías
design-reference/                    prototipos de la marca ANTIGUA (histórico)
```

## Convenciones para contribuir

- **Tokens de diseño**: nada de colores sueltos en JSX. Todo vía tokens de `@theme` en `globals.css` (`ink`, `neon`, `neon-mint`, `neon-lime`, `accent`, `bg-panel`, `bg-elevated`, `danger`, `warning`, y la jerarquía `text-strong` / `text-body` / `text-muted` / `text-faint`).
- **Mutaciones = Server Actions + Zod**: validación en servidor siempre (`src/lib/actions/` + `src/lib/validation/`).
- **Nada de embeds PostgREST**: queries planas (`select` simples por tabla) y composición en JS con `Map`. Evita `select("*, tabla_relacionada(*)")`.
- **Weekday**: convención del proyecto `1 = Lunes … 7 = Domingo` (helpers en `src/lib/format.ts`). Ojo al convertir desde `Date.getDay()` (0 = Domingo).
- **RLS es la barrera real**: la UI oculta, pero la seguridad la imponen las policies (0008, 0019, 0020, 0026, 0027). Toda tabla nueva lleva RLS y policies documentadas en su migración.
- **Reglas de negocio duras → triggers de Postgres**, no solo Server Actions. Con la clave publicable se puede escribir por REST saltándose la validación de la app.
- **Los guards de columnas se escriben por lista blanca** (`to_jsonb(new) - 'col'`), nunca enumerando las prohibidas: una lista negra se queda obsoleta en silencio en cuanto se añade una columna.
- **Nada de `z.coerce.number().optional().or(z.literal(""))`**: `Number("")` da `0`, así que la rama del vacío no se evalúa nunca y "sin valor" se convierte en cero. Usa `optionalNumber()` de `lib/validation/numbers.ts`.
- **Fechas del panel**: `<input type="datetime-local">` no lleva zona y Vercel corre en UTC. Siempre por `lib/datetime-madrid.ts`.
- **Imágenes de la web pública** (portadas de evento y markdown) pasan por `safeImageSrc` (`lib/images.ts`): lista blanca de orígenes, por RGPD.
- **Nada de datos inventados** en la web: precios, fechas, reseñas o eventos solo con datos reales. Si no los hay, estado vacío honesto.
- **Tipos**: `src/types/database.ts` se mantiene a mano en sincronía con las migraciones (ver "Tipos de la BD").
- **Mobile-first, sin excepciones**: toda la navegación debe existir por debajo de 768px, objetivos táctiles ≥44px, campos de formulario a 16px en móvil (por debajo, Safari iOS hace zoom al enfocar), `min-h-dvh` y `minmax(min(Npx,100%),1fr)` en los grids `auto-fit`.
- **`package.json` y `pnpm-lock.yaml` van en el mismo commit**: Vercel instala con `--frozen-lockfile`, así que un lockfile desincronizado tumba el despliegue antes de compilar nada (`ERR_PNPM_OUTDATED_LOCKFILE`). Tras tocar dependencias: `pnpm install --lockfile-only` y comprobarlo con `pnpm install --frozen-lockfile`.
- **Antes de dar algo por terminado**: `pnpm typecheck && pnpm test && pnpm test:e2e`.

## Deploy

- **App**: Vercel. Configura en el proyecto todas las variables de `.env.example` con los valores de producción.
- **BD**: proyecto de Supabase cloud. Vincula (`supabase link --project-ref <ref>`) y aplica migraciones con `pnpm db:push`.
- **Seed en producción**: `supabase/seed.sql` es **solo datos de prueba** (profesores, alumnos, cursos y premios ficticios). El catálogo real de modalidades y niveles vive en la migración `0025`, que es idempotente. **No apliques el seed en producción.**
- **Crons**: `vercel.json` declara `keep-alive` (06:00 UTC) y `cumpleanos` (08:00 UTC), y Vercel les manda el `CRON_SECRET` por su cuenta. `recordatorio-clase` lo dispara n8n con el header `x-cron-secret`.
- `/area-privada/**` es NOINDEX; `sitemap.xml` y `robots.txt` se generan desde `NEXT_PUBLIC_SITE_URL`.

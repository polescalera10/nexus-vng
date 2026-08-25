# Informe de repositorio y base de datos — 25-08-2026

Revisión completa del repo `nexus-vng` y del proyecto Supabase `aranha-baile`
(`vruqtozggrntirdjmezy`) tras el pase de trabajo del 25-08-2026.

---

## 1 · Hallazgo crítico: producción llevaba dos meses con el esquema viejo

`supabase_migrations` solo registraba **0001–0009, 0021, 0022, 0023 y 0024**.
Las migraciones **0010–0020** existían en el repo desde el 17–18 de julio pero
**nunca se aplicaron contra Postgres**.

Consecuencia práctica: no existían `students`, `teachers`, `courses`,
`class_sessions`, `enrollments`, `attendance` ni `whatsapp_events`. Las
secciones **Alumnos, Cursos, Profesores y WhatsApp del panel consultaban tablas
inexistentes** — cada consulta devolvía error, se registraba en consola y la
pantalla se pintaba vacía. Solo Leads e Intensivos funcionaban, porque son los
dos módulos que se construyeron sobre tablas que sí existían.

Además, `modalidades` y `niveles` estaban **vacías**: lo que se veía en los
desplegables del panel y en la web era el fallback estático de
`src/content/landing.ts`, no el catálogo real.

**Resuelto.** Aplicadas 0010–0020 en orden y registrada la 0021 (su columna ya
estaba puesta a mano). El esquema de producción coincide ya con el repo.

### Bug encontrado al aplicarlas

`0013_courses.sql` fallaba con:

```
cannot drop column profesor_id of table courses because other objects depend on it
DETAIL: policy "inscripciones: alumno ve lo suyo…" on table inscripciones depends on it
```

Las políticas de `inscripciones` y `asistencia` leen `clases.profesor_id` dentro
de un `EXISTS`, así que Postgres las cuenta como dependientes de la columna. La
0013 solo retiraba las políticas de `clases`; las otras se retiraban más tarde
(0015/0016), demasiado tarde. **Corregido en el repo**: la 0013 las retira todas
antes de tocar columnas.

> Nota de método: esta migración nunca se había probado contra un Postgres real
> (el `Pendiente` de `CLAUDE.md` lo decía). Merece la pena `supabase start` +
> `pnpm db:reset` antes de dar por buena una tanda de migraciones.

---

## 2 · Datos inventados publicados en la web

`src/lib/queries/eventos.ts` traía un `eventosFallback` con **dos eventos
ficticios** ("Fiesta social mensual" del 4 de julio y "Masterclass de bachata"
del 18 de julio) que se servían cuando la tabla estaba vacía. Y además **esas
dos filas estaban de verdad en producción** desde el 19-06-2026 y marcadas como
públicas: `nexusvng.es/eventos` llevaba meses anunciando dos citas que no
existen, ambas ya pasadas.

Va en contra de la regla de honestidad del proyecto (nada de datos de negocio
inventados) y, con fechas y precios de por medio, roza la publicidad engañosa.

**Resuelto:**

- Fuera el `eventosFallback`. Sin eventos publicados, la página enseña su estado
  vacío (que ya estaba escrito y no se llegaba a ver nunca).
- Las dos filas de producción pasan a `publico = false`. **No se han borrado**:
  el texto sirve de plantilla y la decisión de eliminarlas es tuya.

---

## 3 · Bugs y problemas corregidos

| # | Dónde | Qué pasaba | Estado |
|---|-------|------------|--------|
| 1 | `supabase/migrations/0013_courses.sql` | Migración que no podía aplicarse (políticas dependientes). | Corregido |
| 2 | `src/lib/queries/eventos.ts` | Dos eventos inventados publicados en la web. | Corregido |
| 3 | `src/lib/validation/gamificacion.ts`, `validation/evento.ts` | `z.coerce.number().optional().or(z.literal(""))` **no funciona**: `Number("")` da `0`, así que la rama del vacío nunca se evalúa. Un premio sin stock nacía "agotado" y un evento sin precio se anunciaba "gratis". | Corregido (`lib/validation/numbers.ts`) |
| 4 | Portadas de evento | La imagen de portada solo se validaba como `http(s)://…`, así que aceptaba cualquier host de terceros y lo cargaba en una página pública (IP y user-agent del visitante a un tercero sin base legal). El markdown de la ficha sí lo filtraba desde la auditoría B2: las dos rutas hacían cosas distintas. | Corregido (`lib/images.ts` compartido) |
| 5 | Funciones SECURITY DEFINER | `handle_new_user`, `rls_auto_enable`, `set_updated_at` y los guards eran invocables por `anon` vía `/rest/v1/rpc/…`. En Postgres **PUBLIC tiene EXECUTE por defecto**, así que revocar solo de `anon`/`authenticated` no quita nada. | Corregido (migración 0030) |
| 6 | Guards de columnas (0020) | Estaban escritos como lista negra de columnas. Cada columna nueva (`birthday`, `profile_id`…) se quedaba fuera del guard **en silencio**: un profesor podría haberla modificado por REST. | Corregido: ahora es lista blanca (`to_jsonb(new) - 'col'`) |
| 7 | Barra de pestañas móvil | Con nueve secciones de admin, nueve pestañas no caben a 320px sin bajar de los 44px de objetivo táctil que exige el proyecto. | Corregido: 4 pestañas + menú "Más" |
| 8 | Autenticación de crons | `keep-alive` esperaba `Authorization: Bearer` (Vercel) y `recordatorio-clase` esperaba `x-cron-secret` (n8n). Añadir un cron nuevo obligaba a acertar cuál. | Unificado en `cronRequestIsAuthorized` |
| 9 | `tests/unit/intensivo.test.ts` | `tsc --noEmit` fallaba desde antes de esta sesión (índice de array posiblemente `undefined`). | Corregido |
| 10 | `src/lib/actions/*` | Tres copias privadas idénticas de `isAdmin()` releyendo `profiles` por su cuenta (`courses`, `enrollments`, `whatsapp-events`), más dos formas distintas de comprobar admin en el resto. | Unificado en `isAdminSession()` |

### Avisos del linter de Supabase que NO se han tocado (y por qué)

- **`is_admin()` y `current_role()` ejecutables por `anon`.** Es intencionado:
  las políticas públicas de `modalidades` y `eventos` (`activo OR is_admin()`)
  las evalúan con el rol del que consulta, así que `anon` necesita EXECUTE. Sin
  sesión devuelven `false`/`null`: no filtran nada.
- **Extensión `citext` en el esquema `public`.** Moverla implica recrear las
  columnas `leads.email`, `students.email` y `teachers.email` que la usan.
  Riesgo alto, beneficio nulo mientras no se exponga el esquema.
- **Leaked password protection desactivada.** Es un ajuste del dashboard de
  Supabase (Authentication → Policies), no del repo. **Recomendado activarlo.**

---

## 3 bis · El entorno local no apunta a la base de datos real

`.env.local` tiene **credenciales de relleno**:

```
NEXT_PUBLIC_SUPABASE_URL=https://dummy-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-anon-key…
SUPABASE_SERVICE_ROLE_KEY=dummy-service-role…
NEXT_PUBLIC_SITE_URL=https://aranhabaile.co…   ← dominio ANTIGUO
```

Consecuencias:

- **Nada de lo que se ve en local sale de la BD real.** Toda consulta pública
  falla y cae al fallback estático, así que el panel entero (Alumnos, Cursos,
  Profesores, Gamificación, Eventos) aparece vacío en `next dev` aunque
  funcione en producción. Es fácil confundir eso con un bug.
- `NEXT_PUBLIC_SITE_URL` apunta al **dominio antiguo**, y esa variable alimenta
  las URLs canónicas y la lista blanca de orígenes de imágenes
  (`safeImageSrc`). En producción está bien; en local, no.

**Recomendación:** `vercel env pull .env.local` para trabajar contra los mismos
valores que producción. El fichero está en `.gitignore` y no se ha subido nunca.

Esto es también el motivo de que en este pase **no se haya podido verificar el
panel contra datos reales**: el entorno de trabajo no tiene esas credenciales.
Lo verificado es `tsc`, `eslint`, **151 tests unitarios** y **159 e2e** en
verde, más `next build` completo.

---

## 4 · Código y datos sin usar

Nada de esto se ha borrado (salvo lo indicado): son decisiones tuyas.

### 4.1 · Con propósito conocido, sin conectar

| Elemento | Para qué se hizo | Recomendación |
|---|---|---|
| `eliminarRegistroIntensivo` (`lib/actions/intensivos.ts`) | Borrar un alta en puerta equivocada durante los intensivos de agosto. La Server Action se escribió el 17-08 y el botón nunca se añadió (ya consta en `MEMORY.md`). | **Mantener** y añadir el botón si va a haber más intensivos; si no, borrar. |
| `intensivo_registros.importe` | Guardar el importe **por fila** para que subir el precio no reescriba la recaudación histórica. Funciona, pero no hay control en la UI: un bono de dos clases hay que corregirlo en Supabase. | **Mantener** la columna; añadir el control si vuelve a haber intensivos. |
| `requireAnyRole()` (`lib/auth.ts`) | Proteger páginas abiertas a varios roles. Ninguna lo es todavía. | **Mantener**: es la pieza natural cuando el profesor comparta pantalla con el admin. Coste cero. |
| `premio_canjeado` (enum `whatsapp_event_type`) | Avisar al alumno de que su premio está listo. Creado en esta sesión, todavía sin emisor. | **Mantener**: quitar un valor de un enum de Postgres es incómodo. |

### 4.2 · Sin uso real

| Elemento | Para qué se hizo | Recomendación |
|---|---|---|
| Tabla `contenido` (migración 0006) | Vídeos, comentarios y material de clase para el área de alumno. Nunca se implementó; **0 filas** y **ninguna referencia en el código**. | **Decidir**: si el área de alumno va a servir material, es el sitio; si no, borrarla (y su enum `contenido_tipo`) simplifica el esquema. |
| `profiles.avatar_url` | Foto de perfil del área privada. Sin uso en código. | **Borrar** o implementar. Hoy es una columna que confunde. |
| `public/images/social_dance_event.png` y `bachata_masterclass.png` | Ilustraban los dos eventos de ejemplo. Al despublicarlos se quedan sin referencias. | **Borrar** salvo que se reutilicen como portada de un evento real. |
| `framer-motion` en `package.json` | Animaciones de entrada; se sustituyeron por CSS + IntersectionObserver el 15-08 y nadie lo importa desde entonces. | **Ya retirado de `package.json`** en esta sesión. Ejecuta `pnpm install` para limpiar el lockfile. |
| `toggleRewardActive`, `pointSources` | Escritos en esta sesión y sustituidos por el toggle del propio formulario y por `manualPointSources`. | **Ya borrados**. |

### 4.3 · Histórico, no es código muerto

- `design-reference/` — bundle de la marca **antigua** (Aranha Baile). `CLAUDE.md`
  ya avisa de no usarlo como referencia visual. Conservar como archivo o mover
  fuera del repo.
- `docs/auditoria-*.md`, `docs/informe-seo-*.md` — auditorías fechadas. Son el
  registro de por qué el código es como es. Conservar.
- `leads-dashboard.html` (223 KB, fuera del repo, en la carpeta del proyecto) —
  el panel suelto que venías usando **porque el panel real no funcionaba**. Con
  el panel operativo ya no hace falta; conviene retirarlo para que no haya dos
  fuentes de verdad sobre los leads.

### 4.4 · Falsos positivos

Un barrido de exportaciones sin importar fuera de su fichero devuelve ~70
resultados, pero casi todos son **tipos** (`CourseDetail`, `StudentListItem`,
`RewardInput`…) que se usan como tipo inferido dentro de su propio módulo. Es
idiomático y no es código muerto. **No hay ningún componente ni fichero
huérfano** en `src/`.

---

## 5 · Qué se ha construido en esta sesión

### Base de datos (migraciones 0025–0030)

- **0025 · catálogo de modalidades.** Columna `categoria` (`clase` /
  `compania`) y alta del catálogo real, incluidas las que faltaban: **Lady Style
  Salsa, Lady Style Bachata, Sexy Style, Cía Salsa y Cía Bachata Lady**. La
  genérica `lady-style` queda inactiva y su URL redirige con **301** a
  `/clases/lady-style-salsa` (`next.config.ts`).
- **0026 · área privada con tres perfiles.** `teachers.email` y
  `students.email` únicos (identidad de acceso), `students.profile_id` (enlace
  ficha ↔ usuario de Auth), `students.birthday`, y RLS del rol `alumno`: su
  ficha, sus matrículas, sus cursos, los profesores de esos cursos y su
  asistencia. Nada más.
- **0027 · gamificación.** `point_rules`, `point_events` (libro mayor),
  `rewards`, `reward_redemptions`, `point_milestones` y la vista
  `student_point_balances`. El saldo **nunca se materializa**: es la suma del
  libro mayor, así que corregir un apunte no descuadra nada.
- **0028 · eventos gestionables.** `slug` obligatorio y único, `fecha_fin`,
  `ubicacion`, `precio`, `capacidad`, `cta_url`, `cover_image_url` y `puntos`.
  Tipos nuevos: congreso, taller, intensivo.
- **0029 · conversión y automatizaciones.** `leads.student_id` +
  `converted_at`, e índices únicos que garantizan una felicitación por alumno y
  año y un aviso por hito.
- **0030 · endurecimiento de RPC.** Ver el punto 3.5.

**Reglas de negocio en la BD, no solo en la app.** Saldo suficiente, stock y
descuento del canje los aplica el trigger `reward_redemptions_apply`. Es
deliberado: un admin con la clave publicable puede escribir por REST saltándose
las Server Actions, que es exactamente el agujero que tiene hoy el control de
aforo de matrícula (documentado en `docs/rls-audit.md`).

### Panel

- **Alta de modalidad al vuelo** desde el formulario de curso y el de profesor,
  sin salir ni perder lo escrito.
- **Email obligatorio** en profesor y alumno + **cumpleaños** en alumno.
- **Convertir un lead en alumno** en un paso, con matrícula opcional en una
  clase (si el rol está lleno entra en lista de espera) y sugerencia automática
  del curso que casa con lo que pidió. El lead **no se borra**: queda enlazado.
- **Gamificación**: ranking, canjes pendientes, catálogo de premios y de reglas,
  y panel de puntos en la ficha de cada alumno.
- **CRUD de eventos** con borrador/publicado, que alimenta `/eventos`.
- **Crear acceso al panel** para alumno o profesor. **No envía ningún correo**:
  crea la cuenta y la enlaza; la persona pide su enlace mágico desde
  `/area-privada`. Un clic del admin no debería disparar un email a un tercero.

### Área de alumno

Deja de ser un placeholder: saldo de puntos, movimientos, sus clases con
horario y profe, catálogo de premios canjeables y estado de sus canjes.

### Automatizaciones

`GET /api/cron/cumpleanos` (cron de Vercel, 08:00 UTC) felicita a quien cumple
años hoy **y** vacía la cola de eventos `pendiente` — que es como salen los
avisos de hito de puntos, porque un trigger de Postgres no puede llamar a n8n.
Contratos en `docs/whatsapp-contracts.md`.

---

## 6 · Pendiente de decisión o de acción tuya

1. **Activar "Leaked password protection"** en Supabase → Authentication.
2. **SMTP propio.** El acceso por enlace mágico va a ser ahora la vía normal de
   entrada de alumnos y profesores. Con el SMTP por defecto de Supabase el
   límite de envíos es bajo y el remitente tiene papeletas de acabar en spam.
   Esto **bloquea** el despliegue del login de alumnos a escala.
3. **`pnpm install`** para que el lockfile refleje la salida de `framer-motion`.
4. **Los dos eventos de ejemplo** están despublicados, no borrados. Decide.
5. **`leads-dashboard.html`**: retirarlo ahora que el panel funciona.
6. **Tabla `contenido` y `profiles.avatar_url`**: mantener o borrar (§4.2).
7. **Plantillas de n8n** para `cumpleanos` y `puntos_hito`: el contrato está
   escrito, los flujos hay que montarlos.
8. **`vercel env pull .env.local`** y repasar el panel en local con datos
   reales (ver §3 bis) antes de dar el pase por cerrado.

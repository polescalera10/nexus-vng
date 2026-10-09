# Auditoría integral — nexusvng.es

**Fecha:** 9 de octubre de 2026
**Alcance:** técnica, arquitectura, código, UI/UX, SEO, rendimiento, ciberseguridad y marketing.
**Complementa a:** `informe-seo-2026-09-29.md` (SEO en detalle), `auditoria-seguridad-2026-08-03.md` e `informe-repo-2026-08-25.md`. Lo que ya está cubierto ahí no se repite: aquí solo hay hallazgos nuevos o cosas que siguen abiertas.

**Método.**
- Código: `tsc`, ESLint, Vitest (555 tests) y `pnpm audit --prod` sobre `main` (`dabc850`).
- Base de datos: advisors de seguridad y rendimiento de Supabase, migraciones de producción frente al repo y consultas de solo lectura (leads, alumnos, actividad, crons).
- Producción: cabeceras, peso del HTML, dominios, ajustes de Auth de Supabase y revisión visual de la home en móvil (375 px).
- Vercel: proyecto, variables de entorno (solo nombres) y errores de runtime de los últimos 7 días.
- GA4: últimos 28 días (11-09 a 08-10). Search Console no estaba accesible en esta sesión: se usan los datos del informe semanal del 05-10.

---

## Resumen

La base técnica es sólida: TypeScript sin errores, 555 tests en verde, CI con RLS probada en pgTAP, CSP bloqueante, HSTS con preload, signups de Supabase desactivados y migraciones de producción idénticas a las del repo (94 de 94). El código no es lo que frena el negocio.

Lo que frena está en cuatro sitios:

1. **Legal a la vista de todos.** Aviso legal, privacidad y cookies están publicados como borrador, con 30 marcas `[TODO]` resaltadas en verde neón y sin titular, NIF ni contacto. Es un incumplimiento de LSSI y RGPD, y además resta confianza a cualquiera que entre.
2. **La regla de puntos por reseña en Google** choca con la política de Google, que prohíbe cualquier incentivo, aunque no dependa de la nota. Pone en riesgo la ficha de Google, que es la palanca principal del SEO local.
3. **El objetivo nº1 de la web, WhatsApp, no se mide de punta a punta.** Hay 57 clics a WhatsApp en 28 días, pero ninguno queda registrado en la base de datos. No se puede saber qué página, canal o campaña trae alumnos.
4. **Una inversión sin activar.** El área de alumnos tiene 70 cuentas creadas y solo 3 alumnos activos en los últimos 7 días. Falta el aviso al alumnado.

### Nota por área

| Área | Nota | Por qué |
|---|---|---|
| Código y calidad | 9,0 | tsc limpio, 0 errores de lint (3 avisos), 555 tests, CI de 3 jobs. Dependencias con parches pendientes |
| Arquitectura | 8,5 | Server Components, RLS como barrera real, reglas duras en triggers y tipos generados. Hay dos piezas muertas: n8n sin configurar y un cron de Vercel que no hace nada |
| Ciberseguridad | 8,0 | CSP, HSTS, Turnstile en el código, signups cerrados y secretos comparados en tiempo constante. Restan Next y sharp sin parchear, Turnstile apagado y un dominio `vercel.app` abierto |
| Rendimiento | 8,5 | HTML de 27 KB con brotli, TTFB de 0,2–0,35 s desde París, caché HIT. La home mide 15.600 px en móvil |
| UI/UX | 7,0 | Estética coherente y mobile-first. El banner de cookies tapa el CTA principal, la home es muy larga y hay tarjetas con iconos que parecen sin terminar |
| SEO | 6,9 | Sin cambios desde el informe del 29-09 (el detalle está ahí). Lo técnico está bien; falta indexación, pack local y enlaces |
| Legal y cumplimiento | 3,0 | Páginas legales en borrador público, incentivo a reseñas y prominencia desigual de los botones del banner de cookies |
| Marketing y medición | 5,5 | GA4 con eventos clave y Consent Mode. WhatsApp sin cerrar el ciclo, enlaces sin UTM y el área de alumnos sin lanzar |

---

## Datos clave (28 días, 11-09 a 08-10)

| Métrica | Valor |
|---|---|
| Sesiones (GA4) | 313, el 92 % en móvil |
| Clics a WhatsApp | 57, de 39 usuarios |
| Leads por formulario (BD) | 33. GA4 solo ve 24: el resto rechazó cookies |
| Leads históricos convertidos en alumno | 102 de 168 (61 %) |
| Leads "nuevo" sin tocar más de 3 días | 0 |
| Alumnos activos / con cuenta / activos en el área en 7 días | 74 / 70 / 3 |

| Canal | Sesiones | Eventos clave |
|---|---|---|
| Google orgánico | 110 | 20 |
| Directo | 66 | 19 |
| Instagram (app) | 65 | 7 |
| WhatsApp (`l.wl.co`) | 27 | 0 |
| ChatGPT | 13 | 3 |
| Instagram (enlaces) | 9 | 3 |

| Página de entrada | Sesiones | Eventos clave | Tasa |
|---|---|---|---|
| `/` | 94 | 15 | 16 % |
| `/clases` | 38 | 13 | 34 % |
| `/eventos/masterclass-bachazouk-de-0-a-1` | 35 | 10 | 29 % |

Quien entra por `/clases` convierte el doble que quien entra por la home.

---

## Acciones ordenadas por impacto

**Quién:** **Claude** lo hago yo sin depender de nadie. **Pol** necesita un dato, un acceso o una decisión que solo tiene Pol. **Ambos** quiere decir que Pol da el dato o el visto bueno y yo hago el resto.

| # | Acción | Área | Impacto | Esfuerzo | Quién |
|---|---|---|---|---|---|
| 1 | Completar y publicar las páginas legales | Legal | Crítico | 30 min Pol + 30 min código | Ambos |
| 2 | Retirar los puntos por reseña en Google | Legal / SEO local | Crítico | 15 min | Ambos (decisión de Pol) |
| 3 | Registrar las conversaciones de WhatsApp como leads | Marketing / medición | Alto | ½ día código | Ambos |
| 4 | Lanzar el área de alumnos al alumnado | Marketing / retención | Alto | 1 h | Ambos |
| 5 | Banner de cookies compacto y con botones iguales | UX / legal | Alto | 1 h | Claude |
| 6 | Aviso por email de cada lead nuevo (sin n8n) | Conversión | Alto | 2 h | Claude |
| 7 | Parchear Next.js (15.5.27+) y sharp (0.35.5+) | Seguridad | Medio-alto | 30 min + tests | Claude |
| 8 | Página de error pública con salida a WhatsApp | Conversión / técnico | Medio | 1 h | Claude |
| 9 | Redirigir `aranha-baile.vercel.app` al dominio | SEO / seguridad | Medio | 5 min | Ambos (permiso) |
| 10 | Indexación y SEO local (pendientes del 29-09) | SEO | Medio-alto | Continuo | Pol |
| 11 | UTM en la bio de Instagram, stories y mensajes | Medición | Medio | 30 min | Ambos |
| 12 | Home más corta y orientada a `/clases` | CRO | Medio | 1 día + test | Ambos (decisión) |
| 13 | Activar Turnstile | Seguridad | Medio-bajo | 15 min Pol | Pol |
| 14 | Iconos reales en "Lo que vas a vivir" | UI | Bajo | 30 min | Claude |
| 15 | Higiene de Supabase (contraseñas filtradas, `citext`) | Seguridad | Bajo | 10 min | Ambos |
| 16 | Hueco de cron de Vercel sin uso | Arquitectura | Bajo | 30 min | Claude |
| 17 | `<img>` de carteles a `next/image` | Rendimiento | Bajo | 30 min | Claude |
| 18 | Documentación desactualizada | Mantenimiento | Bajo | 15 min | Claude |
| 19 | Catalán | SEO | A decidir | — | Pol |

---

## Detalle

### 1. Páginas legales en borrador público · Crítico · Ambos

`/aviso-legal`, `/privacidad` y `/cookies` están publicadas con el texto «Borrador pendiente de completar los datos del titular y revisión jurídica final». Entre las tres suman 30 marcas `[TODO]`, pintadas en verde neón:

- **Aviso legal:** titular, NIF/CIF, email y teléfono vacíos. El art. 10 de la LSSI-CE obliga a mostrarlos; no hacerlo es una infracción leve, con multa de hasta 30.000 €.
- **Privacidad:** sin responsable del tratamiento, sin email de privacidad y sin plazo de conservación de leads, que son datos obligatorios por el art. 13 del RGPD. Hay formularios que recogen nombre, teléfono y email desde junio.
- **Cookies:** sin fecha de publicación.

Además del riesgo legal, cualquier visitante que entre a mirar ve una web a medio hacer, y los evaluadores de calidad de Google miran justo estas páginas.

**Pol aporta:** titular (nombre y apellidos o razón social), NIF/CIF, email legal y de privacidad, teléfono y plazo de conservación de leads (propuesta: 12 meses desde el último contacto). Confirmar también que el domicilio del titular es Rambla del Garraf 32, Sant Pere de Ribes.
**Claude hace:** rellenar lo que ya se sabe (Supabase está en `eu-west-1`, Irlanda; listar los encargados: Supabase, Vercel, Resend, Google, MapTiler y Featurable), poner la fecha, quitar el aviso de borrador y comprobar que no queda ningún `[TODO]` en producción. Recomendación: una revisión de un abogado antes de darlo por cerrado, porque el propio texto lo pide.

### 2. Puntos por reseña en Google · Crítico · Ambos

La migración `0051` da 50 puntos por dejar una reseña en Google. Ya se han dado dos apuntes. El diseño intenta ser legal: premia dejarla, no la nota, y pide que el alumno mencione el incentivo. Pero la política de contenido de Google prohíbe ofrecer cualquier incentivo (dinero, productos o servicios) a cambio de reseñas, sin importar la nota. Las consecuencias posibles son el borrado de reseñas y la restricción de la ficha. La ficha es la palanca principal del SEO local (punto 2 del informe del 29-09) y hoy suma 19 reseñas reales.

**Propuesta:** desactivar la regla (`active = false`, sin borrarla, como las demás reglas retiradas en `0050`), quitarla de `Normas.tsx` y de «Cómo ganar», y seguir pidiendo reseñas a todo el alumnado sin dar nada a cambio. Los dos apuntes ya hechos se pueden dejar o compensar con un apunte de corrección; el saldo no se descuadra porque es una suma de `point_events`.
**Decide Pol;** el cambio lo hago yo (migración, código, test y despliegue).

### 3. WhatsApp sin cerrar el ciclo · Alto · Ambos

El objetivo nº1 de la web es que la gente escriba por WhatsApp, y es el único canal que no deja rastro en la base de datos. La tabla `leads` solo recoge formularios (`curso-regular`, `intensivos`, `masterclass`, `socio-fundador`). Los 57 clics a WhatsApp de este mes acaban en el móvil de Pol y ahí se pierden: no se sabe cuántos se apuntan ni desde qué página o canal llegaron.

El mensaje prerrellenado ya lleva el contexto de la página (`lib/wa-page-context.ts`), así que el dato de origen existe; solo falta guardarlo.

**Claude hace:** en `…/admin/leads`, un botón «Lead de WhatsApp» con alta rápida (nombre, teléfono y página o motivo de origen elegidos de una lista) y origen `whatsapp-web`. Desde ahí entra en el embudo que ya existe: contactado, convertido y alumno.
**Pol hace:** dar de alta cada conversación nueva (unos 15 segundos por persona).
**Qué se gana:** conversión real por página y canal, para saber si el SEO, Instagram o las masterclass traen alumnos y no solo visitas.

### 4. Área de alumnos sin lanzar · Alto · Ambos

Están creadas 70 cuentas de 74 alumnos, pero en los últimos 7 días solo han entrado 3. El aviso al alumnado estaba previsto para la semana del 05-10. Sin él, la gamificación v2, el ranking y el informe diario no devuelven nada.

**Claude hace:** redactar el mensaje de WhatsApp (cómo entrar en `/area-privada` con el email de la ficha, qué se gana y las normas) y comprobar el límite de envíos de Resend antes del día del aviso. El plan gratuito permite 100 emails al día, y 70 enlaces mágicos el mismo día caben, pero muy justos si alguien pide el enlace dos veces.
**Pol hace:** enviarlo a los grupos y decir quién ha entrado. El informe diario de las 9 ya da ese seguimiento.

### 5. Banner de cookies · Alto · Claude

En móvil, el banner ocupa la cuarta parte de abajo de la pantalla y tapa el botón principal de WhatsApp del hero en la primera visita. Es justo el momento con más intención. Además, «Aceptar» va en neón relleno y «Rechazar» solo con borde. La guía de cookies de la AEPD pide que rechazar sea igual de fácil y visible que aceptar.

**Cambio:** banner compacto en móvil (texto de una línea más el enlace y los botones en fila) y los dos botones con el mismo peso visual. Hay un coste asumido: algo menos de gente aceptará, así que GA4 verá menos sesiones. Los leads de la base de datos no cambian.

### 6. Aviso inmediato de cada lead · Alto · Claude

`N8N_WEBHOOK_URL` no existe en Vercel, así que los avisos de leads, cumpleaños y recordatorios no salen. Hoy Pol atiende todos los leads (ninguno lleva más de 3 días sin tocar), pero lo hace revisando el panel. En servicios locales, responder en minutos en lugar de horas cambia mucho la conversión.

**Cambio:** al crear un lead, un email a Pol por Resend, que ya está configurado y funcionando (el informe diario sale cada mañana desde el 04-10). Llevaría nombre, origen, interés y un botón «Responder por WhatsApp» con `buildLeadWaLink`. No hace falta n8n.

### 7. Dependencias con vulnerabilidades · Medio-alto · Claude

`pnpm audit --prod` da 10 avisos: 6 altos y 4 moderados.

| Paquete | Actual | Parche | Riesgo real aquí |
|---|---|---|---|
| `next` | 15.5.24 | ≥ 15.5.27 | Envenenamiento de caché SSG/ISR. Vercel mitiga buena parte, pero la web usa ISR |
| `sharp` | 0.35.4 | ≥ 0.35.5 | CVE en librsvg al procesar SVG. Bajo, porque las imágenes son propias |
| `postcss`, `nanoid`, `source-map-js` | transitivas | — | Solo en build; se arreglan al subir `next` |

**Cambio:** subir `next` y `eslint-config-next` a la última 15.5.x y `sharp` a 0.35.5+, con `package.json` y `pnpm-lock.yaml` en el mismo commit, y pasar `typecheck`, `test` y `test:e2e`. Next 16 queda para otro momento: es un salto mayor y no corre prisa.

### 8. Formularios que fallan tras un despliegue · Medio · Claude

Vercel registra 3 casos de `Failed to find Server Action` en `/contacto` (el último, el 06-10). Pasa cuando alguien tiene la página abierta, se despliega una versión nueva y envía el formulario: el id de la acción ya no existe. La parte pública no tiene `error.tsx`, así que el visitante ve la página de error genérica y el lead se pierde sin que nadie se entere.

**Cambio:** un `error.tsx` en la parte pública con «Algo ha fallado, recarga la página» y un botón directo a WhatsApp, con el evento enviado a GA4 para poder medirlo. Skew Protection lo resolvería de raíz, pero es de pago (plan Pro).

### 9. `aranha-baile.vercel.app` sirve la web entera · Medio · Ambos

Responde 200 con todo el sitio. El canonical apunta a `nexusvng.es`, así que Google no debería indexarlo, pero sigue siendo una copia accesible, con el nombre antiguo, que puede acabar enlazada o indexada. En Vercel › Domains se puede redirigir con 308 a `nexusvng.es`. Lo puedo hacer por el MCP de Vercel con el permiso de Pol, y se tarda un minuto.

### 10. Indexación y SEO local · Medio-alto · Pol

Sin cambios desde el informe del 29-09, que tiene el detalle. Lo que más mueve la aguja sigue siendo trabajo de Pol:

- Reenviar el sitemap y pedir la indexación de las páginas clave (solo había 25 de 47 indexadas).
- Ficha de Google: publicación semanal, fotos y respuesta a todas las reseñas. Pedir reseñas a todo el alumnado sin incentivo (ver punto 2).
- Citas locales: salsaybachata, Serveis Actius, la guía de entidades del Ajuntament, el gimnasio Aranha y la prensa local.

El 12-10 toca medir la indexación según el calendario del informe anterior.

### 11. Atribución de Instagram y WhatsApp · Medio · Ambos

Hay 66 sesiones «directas» y 27 que llegan por WhatsApp (`l.wl.co`) con cero conversiones. Probablemente son alumnos abriendo enlaces de los grupos, pero no se puede saber. La bio de Instagram y las stories llegan sin campaña.

**Claude hace:** una tabla de enlaces con UTM (`?utm_source=instagram&utm_medium=bio`, `…=story`, `utm_source=whatsapp&utm_medium=grupo-alumnos`, `utm_campaign=masterclass-salsa-reparto`…) y, si se quiere, enlaces cortos propios en `nexusvng.es/ir/<código>`, que redirijan con las UTM puestas.
**Pol hace:** usarlos en la bio, las stories y los grupos.

### 12. Home larga · Medio · Ambos (decisión)

La home mide unos 15.600 px en móvil (19 pantallas y 16 secciones) y convierte al 16 %, frente al 34 % de `/clases`. Las secciones que se revelan al hacer scroll se quedan un instante en negro si se baja rápido.

**Propuesta:** subir horario, precios y el CTA de prueba a las tres primeras pantallas, fusionar secciones que repiten mensaje (experiencia, comunidad y «para ti») y medir 4 semanas contra la versión actual. Se necesita el visto bueno de Pol sobre qué secciones sobran.

### 13. Turnstile apagado · Medio-bajo · Pol

El código está desplegado, pero faltan las claves. Hoy no hay spam (0 leads sospechosos en 28 días), así que no corre prisa, pero las Server Actions públicas no tienen más freno que el honeypot. Para activarlo: Cloudflare › Turnstile › Add widget (`nexusvng.es`, *Managed*), dar de alta en Vercel `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` y redesplegar.

### 14. Iconos de "Lo que vas a vivir" · Bajo · Claude

Las tarjetas llevan un cuadrado de color liso (`Experiencia.tsx:28`) en el sitio del icono, y en móvil parece que falta la imagen. Hay dos opciones: iconos SVG propios en línea con la marca (los de `IconoPuntos` sirven de base) o quitar el cuadrado.

### 15. Higiene de Supabase · Bajo · Ambos

- **Leaked password protection** desactivada. Pol la activa en Authentication › Settings con un clic.
- **`citext` en el esquema `public`:** moverla a `extensions`, igual que se hizo con `pg_net` en `0049e`. Lo hago yo con una migración.
- **17 funciones `SECURITY DEFINER` ejecutables por `authenticated`:** es intencionado. Comprobado que los registros públicos están cerrados (`disable_signup: true`), así que solo las alcanzan cuentas creadas desde el panel. No hay que tocar nada.
- **17 índices sin usar:** la base es pequeña; se dejan, porque la mayoría cubren claves foráneas (`0046f`).

### 16. Cron de Vercel sin uso · Bajo · Claude

El plan Hobby admite dos crons y uno de ellos (`cumpleanos`) solo hace un POST a n8n, que no existe, así que no hace nada. Hay dos opciones: pasar el aviso de cumpleaños a email por Resend (como en el punto 6) o liberar el hueco para `recordatorio-clase`.

### 17. Carteles con `<img>` · Bajo · Claude

Hay 3 avisos de lint en `eventos/page.tsx`, `eventos/[slug]/page.tsx` y `MarkdownRenderer.tsx`. Los carteles de eventos se sirven sin AVIF/WebP. Pasarlos a `next/image` (los carteles son locales, en `public/images/eventos/`) reduce el peso de la página de evento, que es la tercera página de entrada.

### 18. Documentación desactualizada · Bajo · Claude

`CLAUDE.md` dice que el proyecto de Vercel se llama `aranha-baile` (ya es `nexus-vng`) y que falta `RESEND_API_KEY` (existe y el informe sale cada día). `MEMORY.md` da la masterclass del 18-10 como borrador, pero ya es pública. Hay que corregirlo para que la próxima sesión no trabaje con datos falsos.

### 19. Catalán · A decidir · Pol

El piloto está en el código y `/ca` da 404. Sigue pendiente de decisión (ver el informe del 29-09, punto 11).

---

## Lo que está bien (no tocar)

- Migraciones de producción idénticas a las del repo: 94 de 94.
- RLS con suite pgTAP en la CI, una política por acción y helpers sin `EXECUTE` para `anon`.
- Registros públicos de Auth cerrados y login por enlace mágico con SMTP propio.
- CSP bloqueante, HSTS con preload, `X-Frame-Options: DENY`, `poweredByHeader: false` y secretos comparados en tiempo constante.
- Región `cdg1` y caché HIT: TTFB de 0,2–0,35 s.
- Crons de pg_cron funcionando: 21 de 21 ejecuciones correctas en 7 días. El informe diario se envía cada mañana a las 9.
- El embudo de leads: 61 % de conversión histórica y ninguno sin atender.

---

## Bloque autónomo propuesto

Lo que puedo ejecutar sin datos de Pol, en este orden, con `typecheck`, `test` y `test:e2e` antes de cada push a `main`:

1. Parches de `next` y `sharp` (punto 7).
2. Banner de cookies compacto con botones iguales (punto 5).
3. `error.tsx` público con salida a WhatsApp (punto 8).
4. Email a Pol por cada lead nuevo vía Resend (punto 6).
5. Alta rápida de leads de WhatsApp en el panel, con migración, RLS, test pgTAP y e2e (punto 3).
6. Iconos de «Lo que vas a vivir», carteles con `next/image` y el cron de cumpleaños por email (puntos 14, 16 y 17).
7. Migración de `citext` a `extensions` (punto 15).
8. Correcciones de `CLAUDE.md` y `MEMORY.md` (punto 18).

Necesitan una palabra de Pol antes de empezar: la retirada de la regla de reseñas (2), la redirección del dominio `vercel.app` (9) y el recorte de la home (12). Necesitan datos de Pol: las páginas legales (1).

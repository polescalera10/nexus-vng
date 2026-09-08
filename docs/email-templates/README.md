# Plantillas de email de Supabase Auth

Fuente de verdad de los correos que manda Supabase Auth. El proyecto es
**hosted**, así que Supabase no lee estos archivos: hay que **pegarlos a mano**
en el Dashboard y volver a pegarlos cada vez que se editen aquí.

Dashboard › Authentication › **Emails** › Templates.

| Archivo | Plantilla del dashboard | Asunto | En uso |
|---|---|---|---|
| `magic-link.html` | Magic Link | `Tu enlace de acceso a NEXUS VNG` | Sí — único login de alumnos y profesores |

Las demás plantillas (Confirm signup, Invite user, Reset password, Change email)
no se usan: los usuarios se crean desde el panel con `email_confirm: true` y el
acceso se pide siempre por enlace mágico.

## Reglas al editar

- **CSS en línea, siempre.** Gmail descarta `<style>` en varios contextos.
- **Tablas para la estructura.** Nada de flex ni grid.
- **Sin webfonts.** Anton no existe en el correo: el titular va con Arial Black.
- **Colores explícitos** (`bgcolor` + `style`) en cada celda con fondo, o los
  clientes en modo claro pintan blanco debajo del texto claro.
- **Imágenes por URL absoluta** y con `width`/`height` en el atributo, no solo
  en el `style`. El logo del correo es `public/images/nexus-logo-email.png`
  (360 px de ancho, 34 KB) — versión ligera de `nexus-logo.png` generada con
  `sips --resampleWidth 360`.
- **`{{ .ConfirmationURL }}` aparece dos veces a propósito**: en el botón y en
  texto plano. Hay clientes que no pintan el botón.

## Lo que dice Supabase sobre los emails de autenticación

Son correos transaccionales, no marketing. Su propia guía anti-spam pide:
asunto corto y sin emojis, pocos enlaces y pocas imágenes, nada de taglines ni
firmas de marketing, y cambiar las plantillas poco y de golpe en vez de en
muchos retoques pequeños. Por eso el diseño es una tarjeta con un solo CTA.

## Caducidad del enlace

El texto del correo dice "caduca en 1 hora". Si se cambia el *Email OTP
Expiration* en Authentication › Sign In / Providers › Email, hay que cambiar
también esa frase.

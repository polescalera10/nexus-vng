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
- **El enlace NO usa `{{ .ConfirmationURL }}`.** Esa variable apunta a
  `vruqtozggrntirdjmezy.supabase.co`, un dominio que no es el que firma el
  correo: Resend lo marca como *link URLs don't match sending domain* y los
  filtros lo penalizan. El enlace se construye a mano contra nuestro dominio:

  ```
  {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink
  ```

  `.RedirectTo` es el `emailRedirectTo` que manda `LoginForm.tsx`
  (`https://nexusvng.es/area-privada/callback?next=…`), y por eso el formulario
  pone **siempre** el parámetro `next`: sin query previa, el `&` del `token_hash`
  produce una URL rota. El route handler del callback ya sabe canjear
  `token_hash` + `type` con `verifyOtp`.

  Si algún día se manda un enlace fuera del formulario y `.RedirectTo` viene
  vacío, la variante sin `next` es:
  `{{ .SiteURL }}/area-privada/callback?token_hash={{ .TokenHash }}&type=magiclink`
  (pierde el destino profundo, entra por el panel que toque según el rol).

- **El enlace aparece dos veces a propósito**: en el botón y en texto plano.
  Hay clientes que no pintan el botón.

## Remitente y autenticación del dominio

- **Nada de `no-reply@`.** Resend lo avisa y los filtros lo puntúan peor: un
  buzón que no recibe respuestas es señal de correo masivo. El remitente se
  cambia en Supabase Dashboard › Project Settings › Authentication › SMTP
  Settings (`Sender email`), no en esta plantilla. La dirección buena es
  **`contacto@nexusvng.es`**.
- **`contacto@nexusvng.es` es un reenvío, no un buzón.** Va por
  [Forward Email](https://forwardemail.net) — gratis y sin cuenta, se configura
  solo con DNS, igual que en `artesmarcialesgarraf.es`. En el DNS de Vercel
  (10-09-2026): dos MX de prioridad 0 a `mx1`/`mx2.forwardemail.net` y un TXT
  en la raíz `forward-email=contacto:polescalera10@gmail.com`. Lo que llegue a
  esa dirección aparece en el Gmail de Pol. Para responder desde ella hace
  falta configurar "Enviar como" en Gmail; si no, la respuesta sale con la
  dirección personal.
- **DMARC**: `_dmarc.nexusvng.es` TXT
  `v=DMARC1; p=none; sp=none; adkim=r; aspf=r; fo=1` (dado de alta el
  10-09-2026 en el DNS de Vercel). Está en modo observación: subir a
  `p=quarantine` cuando lleve unas semanas sin sorpresas.
- SPF y DKIM los pone Resend en `send.nexusvng.es` y `resend._domainkey`.

## Lo que dice Supabase sobre los emails de autenticación

Son correos transaccionales, no marketing. Su propia guía anti-spam pide:
asunto corto y sin emojis, pocos enlaces y pocas imágenes, nada de taglines ni
firmas de marketing, y cambiar las plantillas poco y de golpe en vez de en
muchos retoques pequeños. Por eso el diseño es una tarjeta con un solo CTA.

## Caducidad del enlace

El texto del correo dice "caduca en 1 hora". Si se cambia el *Email OTP
Expiration* en Authentication › Sign In / Providers › Email, hay que cambiar
también esa frase.

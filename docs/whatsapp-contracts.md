# Contratos de eventos WhatsApp (app → n8n)

> Referencia para configurar los flujos de n8n. Cada evento que la app entrega
> al webhook `N8N_WEBHOOK_URL` sigue el contrato de este documento.

## Arquitectura

La app **nunca llama a Meta/WhatsApp**. El flujo siempre es:

1. La app inserta una fila en `whatsapp_events` (log/cola, `status = 'pendiente'`).
2. La app hace `POST` del evento a `N8N_WEBHOOK_URL` (JSON, timeout 5 s).
3. Si el POST responde 2xx → la fila pasa a `enviado` (+ `sent_at`).
   Si falla (timeout, red, HTTP no-2xx) → la fila pasa a `error`.
4. **n8n** renderiza la plantilla del tipo de evento y hace el envío real
   (WhatsApp Business / proveedor que corresponda).

⚠️ **`status = 'enviado'` significa "entregado a n8n", NO entrega real del
WhatsApp.** La entrega real solo la conoce n8n/Meta. Si un flujo de n8n falla,
en el panel el evento seguirá como "Enviado a n8n".

El despacho es *best-effort*: un fallo del webhook nunca revierte la operación
de negocio que lo disparó (promoción, sustitución, etc.). Los eventos en
`error` quedan en la tabla como cola de reintento manual (roadmap).

## Shape del POST (común a todos los tipos)

```json
{
  "event_id": "9b3f…-uuid de whatsapp_events.id",
  "type": "recordatorio_clase | cuota_pendiente | alumno_inactivo | confirmacion_lista_espera | broadcast",
  "student_id": "uuid del alumno o null",
  "payload": { "…claves según el tipo…" },
  "created_at": "2026-07-18T08:00:12.345Z"
}
```

- `event_id` identifica el evento de forma única: úsalo en n8n como clave de
  idempotencia (si el mismo `event_id` llega dos veces, procesa solo uno).
- `student_id` es `null` en los `broadcast`: los destinatarios van dentro de
  `payload.recipients[]`.
- Los teléfonos van tal cual están en la ficha (formato libre); normalízalos
  en n8n si el proveedor exige formato E.164.

> Nota: el formulario público de leads también hace POST a la misma
> `N8N_WEBHOOK_URL` pero con otro shape (campos del lead + `recibido_en`),
> sin `event_id` ni `type`. Distingue ambos casos en el flujo de entrada.

---

## 1 · `recordatorio_clase`

**Disparo:** cron diario. n8n llama una vez al día (idealmente por la mañana,
hora de Madrid) a:

```
GET https://<app>/api/cron/recordatorio-clase
Header: x-cron-secret: <CRON_SECRET>
```

La ruta (service role, sin RLS):

1. Asegura las `class_sessions` de **mañana** para los cursos `active` cuyo
   `weekday` coincida (upsert que ignora duplicados y respeta
   `start_date`/`end_date`).
2. Por cada sesión `programada` de mañana, despacha un evento por alumno con
   matrícula `activa` (y ficha activa).

Responde `{ "sessions": n, "dispatched": n, "skipped": n }` — `skipped` son
alumnos que ya tenían el recordatorio de esa sesión.

**Idempotencia:** además del `event_id`, la ruta deduplica por
`payload->>session_id`: reejecutar el cron el mismo día no duplica
recordatorios (los ya creados cuentan como `skipped`).

**Payload:**

```json
{
  "session_id": "uuid de class_sessions.id",
  "course_id": "uuid del curso",
  "course_name": "Bachata Inter 1",
  "session_date": "2026-07-19",
  "weekday": "Domingo",
  "start_time": "19:00",
  "student_name": "María López",
  "phone": "+34 600 111 222"
}
```

---

## 2 · `cuota_pendiente`

**Disparo:** manual. Botón "Avisar por WhatsApp" en la ficha del alumno
(`/area-privada/admin/alumnos/[id]`), visible solo si su cuota está
`pendiente`. Solo admin.

**Payload:**

```json
{
  "student_name": "María López",
  "phone": "+34 600 111 222"
}
```

**Dedupe:** no hay automático — el admin puede reenviar el aviso cuando
quiera. Si hace falta limitar frecuencia, hazlo en n8n (p. ej. ignorar si ya
se envió uno al mismo alumno esa semana).

---

## 3 · `alumno_inactivo`

**Disparo:** manual. Botón "Avisar por WhatsApp" en la lista revisable de
`/area-privada/admin/alumnos/inactivos` (alumnos activos, con matrícula
activa y sin asistencia `present = true` en los últimos 14 días). Solo admin.

**Payload:**

```json
{
  "student_name": "María López",
  "phone": "+34 600 111 222",
  "last_attendance": "2026-06-28"
}
```

`last_attendance` es la fecha (`YYYY-MM-DD`) de la última sesión a la que
asistió, o `null` si nunca ha asistido.

**Dedupe:** manual (criterio del admin), igual que `cuota_pendiente`.

---

## 4 · `confirmacion_lista_espera`

**Disparo:** automático. Al promover una matrícula de `lista_espera` a
`activa` desde el detalle del curso (acción `promoteFromWaitlist`), tras
guardar con éxito.

**Payload:**

```json
{
  "student_name": "María López",
  "phone": "+34 600 111 222",
  "course_name": "Bachata Inter 1",
  "weekday": "Martes",
  "start_time": "20:00"
}
```

**Dedupe:** uno por promoción. Si la misma matrícula vuelve a lista de espera
y se promueve otra vez, se emite otro evento (comportamiento deseado).

---

## 5 · `broadcast`

Una **sola fila** por envío, con `student_id: null` y los destinatarios en
`payload.recipients[]` — es n8n quien abanica (un mensaje por recipient).
Distingue el subtipo por `payload.kind`:

### 5a · `kind: "mensaje"` — broadcast del composer

**Disparo:** manual. Composer de `/area-privada/admin/whatsapp`: el admin
elige un **curso concreto** (matrículas `activa` de alumnos activos) o un
**nivel concreto** (alumnos activos de ese nivel), escribe el mensaje libre y
confirma con el nº de destinatarios.

**Payload:**

```json
{
  "kind": "mensaje",
  "audience": { "kind": "curso", "id": "uuid", "label": "Bachata Inter 1" },
  "message": "¡Este viernes fiesta social en la escuela a las 21:00!",
  "recipients": [
    { "student_id": "uuid", "full_name": "María López", "phone": "+34 600 111 222" },
    { "student_id": "uuid", "full_name": "Joan Puig", "phone": "+34 600 333 444" }
  ]
}
```

`audience.kind` es `"curso"` o `"nivel"`; `label` es el nombre legible.
El texto a enviar es `message` tal cual (plantilla libre).

### 5b · `kind: "sustitucion"` — aviso al profe sustituto

**Disparo:** automático. Al asignar sustituto a una sesión
(`assignSubstitute`); al **quitar** la sustitución no se emite nada.

El destinatario es un *teacher*, pero `whatsapp_events.student_id` es FK a
`students`: por eso viaja como subtipo de `broadcast` con el profe dentro de
`recipients[]` (con `teacher_id` en lugar de `student_id`).

**Payload:**

```json
{
  "kind": "sustitucion",
  "recipients": [
    { "teacher_id": "uuid", "full_name": "Laura Gómez", "phone": "+34 600 555 666" }
  ],
  "course_name": "Salsa Iniciación",
  "session_date": "2026-07-21",
  "weekday": "Martes",
  "start_time": "19:00"
}
```

`phone` puede ser `null` si el profe no tiene teléfono en su ficha — en ese
caso n8n debe saltarse el envío (y, si se quiere, avisar al admin).

**Roadmap (Fase 4):** añadir un enum dedicado (p. ej. `aviso_sustituto`) a
`whatsapp_event_type` requiere migración; mientras tanto este subtipo vive
bajo `broadcast` + `payload.kind`.

---

## 6 · `cumpleanos`

**Disparo:** automático. `GET /api/cron/cumpleanos`, una vez al día (cron de
Vercel a las 08:00 UTC, ver `vercel.json`). Recorre los alumnos **activos**
cuya fecha de `birthday` cae hoy en hora de Madrid.

**Payload:**

```json
{
  "anio": "2026",
  "fecha": "2026-08-25",
  "student_name": "María López",
  "nombre_corto": "María",
  "phone": "+34600111222",
  "edad": 32
}
```

**Dedupe:** una felicitación por alumno y año. Doble red: la ruta consulta los
eventos `cumpleanos` de este año antes de encolar, y hay un índice único
parcial en BD sobre `(student_id, payload->>'anio')` (migración 0029) que
bloquea el duplicado aunque el cron se reintente en paralelo.

---

## 7 · `puntos_hito`

**Disparo:** automático, **desde la base de datos**. El trigger
`point_events_check_milestones` (migración 0027) mira si el saldo del alumno ha
cruzado alguno de los hitos activos de `point_milestones` y encola la fila.

⚠️ Es el único tipo que **no** nace en la app: un trigger de Postgres no puede
hacer POST a n8n, así que la fila se queda en `pendiente`. La vacía el mismo
cron de cumpleaños (`flushPendingWhatsappEvents`). Si ese cron se desactiva,
estos avisos se acumulan sin enviarse.

**Payload:**

```json
{
  "hito": 500,
  "label": "500 puntos",
  "saldo": 512
}
```

**Dedupe:** índice único parcial sobre `(student_id, payload->>'hito')`
(migración 0029). El trigger inserta con `on conflict do nothing`, así que un
duplicado nunca revienta el apunte de puntos que lo disparó.

---

## 8 · `premio_canjeado`

**Reservado.** El tipo existe en el enum desde la migración 0027 pero todavía
no lo emite nadie: los canjes se gestionan dentro del panel
(`/area-privada/admin/gamificacion`) y se entregan en clase. Está preparado
para cuando se quiera avisar al alumno de que su premio está listo.

---

## Estados de `whatsapp_events`

| status      | Significado                                                        |
|-------------|--------------------------------------------------------------------|
| `pendiente` | Fila creada; el POST a n8n aún no se ha confirmado.                |
| `enviado`   | n8n respondió 2xx (**no** implica entrega del WhatsApp). `sent_at` guarda el momento. |
| `error`     | El POST falló (timeout, red o HTTP no-2xx). Reintento manual/roadmap. |

La tabla solo es visible para el admin (RLS); las rutas cron escriben con el
service role.

**Cómo se vacía la cola.** Los eventos que nacen en la app se despachan en el
acto (`dispatchWhatsappEvent`). Los que nacen en un trigger de Postgres
(`puntos_hito`) no pueden hacerlo, así que `flushPendingWhatsappEvents` recoge
todo lo que siga en `pendiente` y lo reenvía; lo llama
`GET /api/cron/cumpleanos` en su pasada diaria.

**Autenticación de los crons.** `cronRequestIsAuthorized` acepta las dos
formas: `Authorization: Bearer $CRON_SECRET` (lo que manda Vercel Cron por su
cuenta) y `x-cron-secret: $CRON_SECRET` (lo que manda n8n). La comparación es
en tiempo constante.

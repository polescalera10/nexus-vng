"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { saveEvento, type EventoFormState } from "@/lib/actions/eventos";
import { isoToMadridLocal } from "@/lib/datetime-madrid";
import { EVENTO_TIPO_LABELS } from "@/lib/format";
import { eventoTipos, slugifyEvento } from "@/lib/validation/evento";
import type { Evento } from "@/types/database";

const initial: EventoFormState = { status: "idle" };

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {isEdit ? "Guardar cambios" : "Crear evento"}
    </Button>
  );
}

/**
 * Alta y edición de evento. Lo que se guarda aquí es lo que sale en
 * `/eventos` y en su ficha pública.
 *
 * El slug se deriva del título mientras nadie lo toque a mano: en un evento
 * nuevo es siempre lo que quieres, y en uno ya publicado cambiarlo rompería la
 * URL — por eso en edición arranca "tocado" y no se recalcula solo.
 */
export function EventoForm({ evento }: { evento?: Evento }) {
  const [state, formAction] = useActionState(saveEvento, initial);
  const isEdit = Boolean(evento);

  const [titulo, setTitulo] = useState(evento?.titulo ?? "");
  const [slug, setSlug] = useState(evento?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(isEdit);
  const [publico, setPublico] = useState(evento?.publico ?? false);

  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} noValidate className="grid gap-4 sm:grid-cols-2">
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <input type="hidden" name="publico" value={publico ? "on" : ""} />

      <div className="sm:col-span-2">
        <Input
          label="Título"
          name="titulo"
          required
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (!slugTocado) setSlug(slugifyEvento(e.target.value));
          }}
          placeholder="Fiesta social de octubre"
          error={err("titulo")}
        />
      </div>

      <div className="sm:col-span-2">
        <Input
          label="URL (slug)"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTocado(true);
            setSlug(e.target.value);
          }}
          hint={`Se publicará en /eventos/${slug || "…"}`}
          error={err("slug")}
        />
      </div>

      <Select label="Tipo" name="tipo" required defaultValue={evento?.tipo ?? "fiesta"} error={err("tipo")}>
        {eventoTipos.map((t) => (
          <option key={t} value={t}>
            {EVENTO_TIPO_LABELS[t]}
          </option>
        ))}
      </Select>

      <Input
        label="Ubicación (opcional)"
        name="ubicacion"
        defaultValue={evento?.ubicacion ?? ""}
        placeholder="Gimnasio Aranha, Vilanova i la Geltrú"
        error={err("ubicacion")}
      />

      <Input
        label="Empieza"
        name="fecha"
        type="datetime-local"
        required
        defaultValue={isoToMadridLocal(evento?.fecha ?? null)}
        hint="Hora de Madrid."
        error={err("fecha")}
      />

      <Input
        label="Termina (opcional)"
        name="fecha_fin"
        type="datetime-local"
        defaultValue={isoToMadridLocal(evento?.fecha_fin ?? null)}
        hint="Sin esto, la ficha no anuncia hora de cierre."
        error={err("fecha_fin")}
      />

      <Input
        label="Precio en € (opcional)"
        name="precio"
        type="number"
        inputMode="decimal"
        min={0}
        step="0.5"
        defaultValue={evento?.precio ?? ""}
        hint="0 = entrada gratuita. Vacío = no se anuncia precio."
        error={err("precio")}
      />

      <Input
        label="Aforo (opcional)"
        name="capacidad"
        type="number"
        inputMode="numeric"
        min={1}
        defaultValue={evento?.capacidad ?? ""}
        error={err("capacidad")}
      />

      <Input
        label="Puntos por asistir"
        name="puntos"
        type="number"
        inputMode="numeric"
        min={0}
        defaultValue={evento?.puntos ?? 0}
        hint="Gamificación. 0 = este evento no puntúa."
        error={err("puntos")}
      />

      <Input
        label="Enlace de inscripción (opcional)"
        name="cta_url"
        type="url"
        defaultValue={evento?.cta_url ?? ""}
        placeholder="https://…"
        hint="Si lo dejas vacío, el botón lleva a WhatsApp."
        error={err("cta_url")}
      />

      <div className="sm:col-span-2">
        <Input
          label="Imagen de portada (opcional)"
          name="cover_image_url"
          defaultValue={evento?.cover_image_url ?? ""}
          placeholder="/images/social.png o https://…"
          error={err("cover_image_url")}
        />
      </div>

      <div className="sm:col-span-2">
        <Textarea
          label="Descripción"
          name="descripcion"
          rows={12}
          defaultValue={evento?.descripcion ?? ""}
          hint="Admite Markdown: ## títulos, **negrita**, listas e imágenes."
          error={err("descripcion")}
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <Toggle checked={publico} onChange={setPublico} label="Publicado en la web" />
        <span className="font-body text-sm font-semibold text-text-strong">
          {publico ? "Visible en /eventos" : "Borrador (no se publica)"}
        </span>
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger sm:col-span-2"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton isEdit={isEdit} />
        <Button variant="ghost" href="/area-privada/admin/eventos">
          Cancelar
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  convertLeadToStudent,
  type LeadConversionState,
} from "@/lib/actions/lead-conversion";
import { DANCE_ROLE_LABELS, formatTime, WEEKDAYS } from "@/lib/format";
import type { CourseOption } from "@/lib/queries/courses";
import type { DanceRole, Lead } from "@/types/database";

const initial: LeadConversionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Crear alumno
    </Button>
  );
}

/** Plazas libres legibles: "3 leaders · 1 follower" o "sin límite". */
function plazas(course: CourseOption): string {
  const partes = [
    course.free_leaders === null ? "leaders sin límite" : `${course.free_leaders} leaders`,
    course.free_followers === null
      ? "followers sin límite"
      : `${course.free_followers} followers`,
  ];
  return partes.join(" · ");
}

/**
 * Aceptar un lead como alumno. Llega con los datos del formulario de la web ya
 * puestos: en el caso bueno es leer, elegir clase y darle a crear.
 *
 * El teléfono viene normalizado a E.164 desde el servidor porque el formulario
 * público lo acepta en texto libre y `students.phone` no.
 */
export function ConvertLeadForm({
  lead,
  phoneE164,
  courses,
  suggestedCourseId,
}: {
  lead: Lead;
  phoneE164: string;
  courses: CourseOption[];
  /** Curso que casa con lo que pidió el lead, si se ha podido deducir. */
  suggestedCourseId?: string;
}) {
  const [state, formAction] = useActionState(convertLeadToStudent, initial);
  const [danceRole, setDanceRole] = useState<DanceRole>("both");
  const [courseId, setCourseId] = useState(suggestedCourseId ?? "");

  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} noValidate className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="lead_id" value={lead.id} />

      <div className="sm:col-span-2">
        <Input
          label="Nombre completo"
          name="full_name"
          required
          defaultValue={lead.nombre}
          error={err("full_name")}
        />
      </div>

      <Input
        label="Teléfono"
        name="phone"
        inputMode="tel"
        required
        defaultValue={phoneE164}
        hint="Formato internacional: +34600000000"
        error={err("phone")}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        defaultValue={lead.email ?? ""}
        hint={lead.email ? undefined : "El lead no dejó email: pídeselo antes de crearlo."}
        error={err("email")}
      />

      <Select
        label="Rol de baile"
        name="dance_role"
        required
        value={danceRole}
        onChange={(e) => setDanceRole(e.target.value as DanceRole)}
        hint="Se puede cambiar después desde su ficha."
        error={err("dance_role")}
      >
        {Object.entries(DANCE_ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Matricular en (opcional)"
        name="course_id"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        hint="Si el grupo está lleno, entra en lista de espera."
        error={err("course_id")}
      >
        <option value="">Solo crear la ficha</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {WEEKDAYS[c.weekday]} {formatTime(c.start_time)} ({plazas(c)})
          </option>
        ))}
      </Select>

      {courseId && (
        <div className="sm:col-span-2">
          <Select
            label="Entra como"
            name="role_in_course"
            required
            defaultValue={danceRole === "leader" ? "leader" : "follower"}
            error={err("role_in_course")}
          >
            <option value="leader">Leader</option>
            <option value="follower">Follower</option>
          </Select>
        </div>
      )}

      <p className="font-body text-sm text-text-muted sm:col-span-2">
        Cumpleaños, nivel y pareja se piden más adelante desde la ficha del alumno.
      </p>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger sm:col-span-2"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton />
        <Button variant="ghost" href="/area-privada/admin/leads">
          Cancelar
        </Button>
      </div>
    </form>
  );
}

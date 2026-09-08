"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { generateSessionsForAllCourses } from "@/lib/actions/courses";
import { formatMonth } from "@/lib/sessions";
import type { CoberturaDelMes } from "@/lib/queries/courses";

/**
 * Generar de golpe las sesiones del mes para todos los cursos activos.
 *
 * Es el gesto de principio de mes: sin esto había que entrar en los quince
 * cursos y darle al botón uno por uno. Y hasta que las sesiones existen, el
 * profe no encuentra su clase para pasar lista y el alumno no ve ni su próxima
 * clase ni el diario — así que el aviso avisa cuando faltan.
 *
 * Repetir el clic no duplica nada: el unique (course_id, session_date) protege
 * y la action ignora las que ya están.
 */
export function SesionesDelMes({ cobertura }: { cobertura: CoberturaDelMes }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const mes = formatMonth(cobertura.month);
  const faltan = cobertura.cursosActivos - cobertura.cursosConSesiones;
  const completo = faltan === 0 && cobertura.cursosActivos > 0;

  return (
    <div
      className={`rounded-lg border p-5 shadow-soft ${
        completo
          ? "border-text-strong/8 bg-bg-panel"
          : "border-warning/30 bg-warning/8"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-body text-[15px] font-bold text-text-strong">
            Sesiones de {mes}
          </h2>
          <p className="mt-1 max-w-[56ch] font-body text-sm text-text-muted">
            {completo ? (
              <>
                Los {cobertura.cursosActivos} cursos activos ya tienen sus sesiones:{" "}
                {cobertura.sesiones} en total. Puedes volver a generar si has añadido
                un curso.
              </>
            ) : (
              <>
                {faltan === cobertura.cursosActivos
                  ? "Ningún curso tiene todavía sesiones este mes."
                  : `Faltan ${faltan} de ${cobertura.cursosActivos} cursos.`}{" "}
                Sin sesiones, los profes no pueden pasar lista ni colgar el vídeo, y
                los alumnos no ven su próxima clase.
              </>
            )}
          </p>
        </div>

        <Button
          variant={completo ? "secondary" : "primary"}
          size="sm"
          loading={pending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const res = await generateSessionsForAllCourses();
              setMessage({
                ok: res.status === "success",
                text: res.message ?? "Error inesperado.",
              });
            });
          }}
        >
          Generar {mes}
        </Button>
      </div>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`mt-3 font-body text-[13px] font-semibold ${
            message.ok ? "text-accent" : "text-danger"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

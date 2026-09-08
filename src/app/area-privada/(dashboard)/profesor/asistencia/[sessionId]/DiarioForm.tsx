"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { saveDiario, type DiarioResult } from "@/lib/actions/diario";
import { parseVideoUrl, VIDEO_URL_HINT } from "@/lib/video";

/**
 * Diario de la clase, en la misma pantalla que la lista.
 *
 * Es el orden real del profe: acaba la clase, pasa lista y cuenta qué se dio.
 * Obligarle a irse a otra pantalla para el vídeo garantiza que no lo haga.
 *
 * La URL se valida en el cliente MIENTRAS escribe (misma función que usa el
 * servidor, `parseVideoUrl`) para que se entere del enlace malo al pegarlo, no
 * al guardar. El servidor la revalida igual: esto es comodidad, no seguridad.
 */

type VideoRow = { key: string; url: string; titulo: string };

const nuevaFila = (): VideoRow => ({
  key: Math.random().toString(36).slice(2),
  url: "",
  titulo: "",
});

export function DiarioForm({
  sessionId,
  initialResumen,
  initialVideos,
}: {
  sessionId: string;
  initialResumen: string;
  initialVideos: { url: string; titulo: string | null }[];
}) {
  const [resumen, setResumen] = useState(initialResumen);
  const [videos, setVideos] = useState<VideoRow[]>(
    initialVideos.length > 0
      ? initialVideos.map((v) => ({
          key: Math.random().toString(36).slice(2),
          url: v.url,
          titulo: v.titulo ?? "",
        }))
      : [nuevaFila()],
  );
  const [result, setResult] = useState<DiarioResult | null>(null);
  const [pending, startTransition] = useTransition();

  const conUrl = videos.filter((v) => v.url.trim().length > 0);
  const invalidas = conUrl.filter((v) => parseVideoUrl(v.url) === null);
  const puedeGuardar = invalidas.length === 0 && !pending;

  function setVideo(key: string, patch: Partial<VideoRow>) {
    setVideos((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
    setResult(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await saveDiario({
        sessionId,
        resumen: resumen.trim(),
        videos: conUrl.map((v) => ({
          url: v.url.trim(),
          titulo: v.titulo.trim() || undefined,
        })),
      });
      setResult(res);
      // Al guardar bien, dejar una fila vacía lista para el siguiente vídeo.
      if (res.status === "success" && conUrl.length === videos.length) {
        setVideos((prev) => [...prev, nuevaFila()]);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Textarea
        label="¿Qué habéis dado hoy?"
        hint="Lo leerá tu grupo. Los pasos por su nombre: el que faltó necesita saber qué repasar."
        placeholder="Enchufla doble, dile que no y la vuelta de la vecina. Repaso del básico con cambio de peso."
        rows={4}
        value={resumen}
        onChange={(e) => {
          setResumen(e.target.value);
          setResult(null);
        }}
        maxLength={4000}
      />

      <div className="flex flex-col gap-4">
        <p className="font-body text-[13px] font-semibold text-text-strong">
          Vídeos de la clase
        </p>

        {videos.map((v, i) => {
          const urlSucia = v.url.trim().length > 0 && parseVideoUrl(v.url) === null;
          return (
            <div
              key={v.key}
              className="flex flex-col gap-3 rounded-sm border border-text-strong/10 bg-bg-elevated/40 p-3.5"
            >
              <Input
                label={`Enlace del vídeo ${i + 1}`}
                type="url"
                inputMode="url"
                placeholder="https://youtu.be/…"
                hint={i === 0 ? VIDEO_URL_HINT : undefined}
                error={urlSucia ? "Solo YouTube, Vimeo o Google Drive" : undefined}
                value={v.url}
                onChange={(e) => setVideo(v.key, { url: e.target.value })}
              />
              <Input
                label="Título (opcional)"
                placeholder="La secuencia completa a tiempo"
                value={v.titulo}
                onChange={(e) => setVideo(v.key, { titulo: e.target.value })}
                maxLength={200}
              />
              {videos.length > 1 && (
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVideos((prev) => prev.filter((row) => row.key !== v.key));
                      setResult(null);
                    }}
                  >
                    Quitar este vídeo
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {videos.length < 10 && (
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setVideos((prev) => [...prev, nuevaFila()])}
            >
              + Añadir otro vídeo
            </Button>
          </div>
        )}
      </div>

      {result?.message && (
        <p
          role={result.status === "error" ? "alert" : "status"}
          className={`rounded-sm border px-4 py-2.5 font-body text-sm ${
            result.status === "error"
              ? "border-danger/30 bg-danger/10 text-danger"
              : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {result.message}
        </p>
      )}

      <div>
        <Button type="submit" loading={pending} disabled={!puedeGuardar}>
          Guardar el diario
        </Button>
      </div>
    </form>
  );
}

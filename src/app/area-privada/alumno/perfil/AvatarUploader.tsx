"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { removeMiAvatar, setMiAvatar } from "@/lib/actions/perfil";
import { createClient } from "@/lib/supabase/client";

/**
 * Foto de perfil del alumno.
 *
 * La subida va del navegador a Storage directamente, no por Server Action: una
 * Server Action está limitada a 1 MB de cuerpo (`next.config.ts`) y una foto
 * hecha con el móvil pesa el triple. La acción solo enlaza la ruta después.
 *
 * Antes de subir, la imagen se recorta cuadrada y se reescala a 512px en un
 * canvas. Un JPEG de cámara son ~4 MB; recortado sale por debajo de 100 KB. En
 * el plan Free hay 1 GB para TODO el proyecto, así que subir el original sería
 * gastarse la cuota entera en cuarenta caras.
 */

const LADO = 512;
const CALIDAD = 0.85;

/** Recorta la imagen al cuadrado central y la devuelve como JPEG de 512px. */
async function aCuadrado(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const lado = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - lado) / 2;
  const sy = (bitmap.height - lado) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sin canvas");
  ctx.drawImage(bitmap, sx, sy, lado, lado, 0, 0, LADO, LADO);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", CALIDAD),
  );
  if (!blob) throw new Error("sin blob");
  return blob;
}

export function AvatarUploader({
  studentId,
  fullName,
  avatarUrl,
}: {
  studentId: string;
  fullName: string;
  /** URL firmada de la foto actual, si la hay. */
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mostrada = previa ?? avatarUrl;

  async function subir(file: File) {
    setError(null);
    setTrabajando(true);
    try {
      const blob = await aCuadrado(file);
      // Nombre nuevo en cada subida: la URL firmada anterior sigue viva hasta
      // que caduca y reutilizar el nombre serviría la foto vieja en caché.
      const path = `${studentId}/${crypto.randomUUID()}.jpg`;

      const { error: subida } = await createClient()
        .storage.from("avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });

      if (subida) throw new Error(subida.message);

      const res = await setMiAvatar(path);
      if (!res.ok) throw new Error(res.message ?? "No se ha podido guardar la foto.");

      setPrevia(URL.createObjectURL(blob));
      router.refresh();
    } catch (e) {
      console.error("[AvatarUploader]", e);
      setError(
        "No se ha podido subir la foto. Prueba con otra imagen (JPG o PNG) desde tu galería.",
      );
    } finally {
      setTrabajando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function quitar() {
    setError(null);
    setTrabajando(true);
    const res = await removeMiAvatar();
    if (!res.ok) setError(res.message ?? "No se ha podido quitar la foto.");
    else setPrevia(null);
    setTrabajando(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar name={fullName} seed={studentId} src={mostrada} size="xl" />

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={trabajando}
            onClick={() => inputRef.current?.click()}
          >
            {mostrada ? "Cambiar foto" : "Subir foto"}
          </Button>
          {mostrada && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={trabajando}
              onClick={quitar}
            >
              Quitar
            </Button>
          )}
        </div>

        <p className="font-body text-xs text-text-muted">
          JPG o PNG. Se recorta cuadrada automáticamente.
        </p>
        {error && (
          <p role="alert" className="font-body text-xs font-semibold text-danger">
            {error}
          </p>
        )}
      </div>

      {/* Fuera del <form> del perfil a propósito: la foto se guarda sola, no
          espera al botón de guardar. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void subir(file);
        }}
      />
    </div>
  );
}

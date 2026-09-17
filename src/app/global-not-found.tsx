import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { NoEncontrada } from "@/components/layout/NoEncontrada";
import { RootShell, viewportBase } from "@/components/layout/RootShell";

/*
  404 de las URLs que no casan con ninguna ruta. Con dos layouts raíz (uno por
  idioma, ver `RootShell`) Next no sabe cuál usar, así que este fichero trae
  su propio `<html>`. Va en castellano: es el idioma por defecto del sitio.
*/
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `Página no encontrada · ${site.name}`,
};

export const viewport: Viewport = viewportBase;

export default function GlobalNotFound() {
  return (
    <RootShell lang="es" conSchema={false}>
      <NoEncontrada />
    </RootShell>
  );
}

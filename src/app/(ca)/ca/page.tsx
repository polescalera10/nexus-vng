import type { Metadata } from "next";
import { Inicio } from "@/components/paginas/Inicio";
import { alternatesDe } from "@/i18n/rutas";
import { tInicioMeta } from "@/i18n/textos/inicio";

export const metadata: Metadata = {
  description: tInicioMeta.ca.description,
  alternates: alternatesDe("/ca"),
};

export const revalidate = 3600;

export default function HomePageCa() {
  return <Inicio locale="ca" />;
}

import type { Metadata } from "next";
import { Horarios, primeraFranja, ultimaFranja } from "@/components/paginas/Horarios";
import { alternatesDe } from "@/i18n/rutas";
import { tHorarios } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  title: tHorarios.ca.title,
  description: tHorarios.ca.description(primeraFranja, ultimaFranja),
  alternates: alternatesDe("/ca/horaris"),
};

export default function HorarisPage() {
  return <Horarios locale="ca" />;
}

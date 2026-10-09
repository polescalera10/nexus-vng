import type { Metadata } from "next";
import { Clases } from "@/components/paginas/Clases";
import { alternatesDe } from "@/i18n/rutas";
import { tClases } from "@/i18n/textos/paginas";

export const metadata: Metadata = {
  title: tClases.ca.title,
  description: tClases.ca.description,
  alternates: alternatesDe("/ca/classes"),
};

export const revalidate = 3600;

export default function ClassesPage() {
  return <Clases locale="ca" />;
}

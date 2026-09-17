import type { Metadata } from "next";

// Toda la zona privada fuera de los índices de búsqueda.
export const metadata: Metadata = {
  title: "Área privada",
  robots: { index: false, follow: false },
};

export default function AreaPrivadaLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg-base">{children}</div>;
}

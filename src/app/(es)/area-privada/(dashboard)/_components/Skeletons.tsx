/**
 * Bloques de carga sobrios para los loading.tsx del panel.
 * Rectángulos text-strong/10 con animate-pulse — sin spinners.
 * (bg-bg-elevated apenas se distinguía del panel oscuro; la transparencia
 * de text-strong garantiza que el pulso se vea sobre cualquier superficie.)
 */

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`animate-pulse rounded-sm bg-text-strong/10 ${className}`} />
  );
}

/** Título + subtítulo (y hueco del botón de acción si aplica). */
export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <SkeletonBlock className="h-10 w-52" />
        <SkeletonBlock className="mt-3 h-4 w-72 max-w-full" />
      </div>
      {withAction && <SkeletonBlock className="h-10 w-36" />}
    </div>
  );
}

/** Tabla o lista: cabecera + n filas. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-text-strong/8 bg-bg-panel shadow-soft">
      <div className="border-b border-text-strong/8 px-4 py-3.5">
        <SkeletonBlock className="h-3.5 w-2/3 max-w-72" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-text-strong/6 px-4 py-4 last:border-b-0">
          <SkeletonBlock className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Card blanca con título y unas líneas de contenido. */
export function CardSkeleton({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-text-strong/8 bg-bg-panel p-5 shadow-soft ${className}`}
    >
      <SkeletonBlock className="h-4 w-32" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonBlock key={i} className={`h-3.5 ${i % 2 === 0 ? "w-full" : "w-3/4"}`} />
        ))}
      </div>
    </div>
  );
}

/** Página de listado: cabecera + tabla. */
export function ListPageSkeleton({
  rows = 6,
  withAction = true,
}: {
  rows?: number;
  withAction?: boolean;
}) {
  return (
    <>
      <PageHeaderSkeleton withAction={withAction} />
      <div className="mt-8">
        <TableSkeleton rows={rows} />
      </div>
    </>
  );
}

/** Página de detalle: enlace de vuelta + título + rejilla de cards. */
export function DetailPageSkeleton() {
  return (
    <>
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-4 h-10 w-64 max-w-full" />
      <SkeletonBlock className="mt-3 h-4 w-48" />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
        <CardSkeleton lines={3} className="lg:col-span-2" />
      </div>
    </>
  );
}

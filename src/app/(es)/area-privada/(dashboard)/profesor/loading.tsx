import {
  CardSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function ProfesorHoyLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      {/* Cards de las clases de hoy */}
      <div className="mt-8 flex flex-col gap-3">
        <CardSkeleton lines={2} />
        <CardSkeleton lines={2} />
      </div>
      {/* Próximas · 7 días */}
      <SkeletonBlock className="mt-10 h-4 w-36" />
      <div className="mt-3">
        <TableSkeleton rows={4} />
      </div>
    </>
  );
}

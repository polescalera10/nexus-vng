import {
  SkeletonBlock,
  TableSkeleton,
} from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function AsistenciaLoading() {
  return (
    <>
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="mt-4 h-9 w-64 max-w-full" />
      <SkeletonBlock className="mt-3 h-4 w-48" />
      {/* Lista de alumnos para pasar lista */}
      <div className="mt-6">
        <TableSkeleton rows={8} />
      </div>
    </>
  );
}

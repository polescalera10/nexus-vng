import {
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function AlumnosLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction />
      {/* Barra de filtros */}
      <div className="mt-8 flex flex-wrap gap-3">
        <SkeletonBlock className="h-10 w-56 max-w-full" />
        <SkeletonBlock className="h-10 w-36" />
        <SkeletonBlock className="h-10 w-36" />
        <SkeletonBlock className="h-10 w-36" />
      </div>
      <SkeletonBlock className="mt-6 mb-3 h-4 w-24" />
      <TableSkeleton rows={8} />
    </>
  );
}

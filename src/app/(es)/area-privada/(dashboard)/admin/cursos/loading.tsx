import {
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function CursosLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction />
      {/* Píldoras Activos / Todos */}
      <div className="mt-6 flex items-center gap-2">
        <SkeletonBlock className="h-8 w-24 rounded-full" />
        <SkeletonBlock className="h-8 w-24 rounded-full" />
      </div>
      <div className="mt-6">
        <TableSkeleton rows={6} />
      </div>
    </>
  );
}

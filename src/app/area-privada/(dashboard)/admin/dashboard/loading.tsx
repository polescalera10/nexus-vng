import {
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/app/area-privada/(dashboard)/_components/Skeletons";

export default function DashboardNegocioLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mt-6">
        <SkeletonBlock className="h-28" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonBlock key={i} className="h-28" />
        ))}
      </div>
      <div className="mt-10">
        <SkeletonBlock className="h-4 w-40" />
        <div className="mt-4">
          <SkeletonBlock className="h-72" />
        </div>
      </div>
      <div className="mt-10">
        <SkeletonBlock className="h-4 w-32" />
        <div className="mt-4">
          <TableSkeleton rows={8} />
        </div>
      </div>
    </>
  );
}

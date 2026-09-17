import {
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function AdminLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>
      <div className="mt-10">
        <SkeletonBlock className="h-4 w-40" />
        <div className="mt-3">
          <TableSkeleton rows={3} />
        </div>
      </div>
      <div className="mt-10">
        <SkeletonBlock className="h-4 w-48" />
        <div className="mt-3">
          <TableSkeleton rows={8} />
        </div>
      </div>
    </>
  );
}

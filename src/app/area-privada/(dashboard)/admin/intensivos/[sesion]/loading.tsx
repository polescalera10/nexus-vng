import {
  SkeletonBlock,
  TableSkeleton,
} from "@/app/area-privada/(dashboard)/_components/Skeletons";

export default function SesionIntensivoLoading() {
  return (
    <>
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-4 h-10 w-56 max-w-full" />
      <SkeletonBlock className="mt-3 h-4 w-64 max-w-full" />
      <div className="mt-8">
        <TableSkeleton rows={8} />
      </div>
    </>
  );
}

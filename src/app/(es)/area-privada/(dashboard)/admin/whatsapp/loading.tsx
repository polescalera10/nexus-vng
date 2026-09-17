import {
  CardSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function WhatsappLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CardSkeleton lines={5} />
        <CardSkeleton lines={3} />
      </div>
      <SkeletonBlock className="mt-10 h-4 w-40" />
      <div className="mt-4">
        <TableSkeleton rows={6} />
      </div>
    </>
  );
}

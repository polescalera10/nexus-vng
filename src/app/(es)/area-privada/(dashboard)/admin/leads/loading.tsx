import { ListPageSkeleton } from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function LeadsLoading() {
  return <ListPageSkeleton rows={6} withAction={false} />;
}

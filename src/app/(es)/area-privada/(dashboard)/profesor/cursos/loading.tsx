import { ListPageSkeleton } from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function ProfesorCursosLoading() {
  return <ListPageSkeleton rows={4} withAction={false} />;
}

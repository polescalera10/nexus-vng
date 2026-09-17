import { ListPageSkeleton } from "@/app/(es)/area-privada/(dashboard)/_components/Skeletons";

export default function AlumnosInactivosLoading() {
  return <ListPageSkeleton rows={5} withAction={false} />;
}

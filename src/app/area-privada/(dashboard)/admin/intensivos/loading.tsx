import { ListPageSkeleton } from "@/app/area-privada/(dashboard)/_components/Skeletons";

export default function IntensivosLoading() {
  return <ListPageSkeleton rows={8} withAction={false} />;
}

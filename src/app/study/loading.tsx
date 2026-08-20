import { WorksListSkeleton } from "@/components/works-list-skeleton";

export default function Loading() {
  return (
    <div className="container-app py-10 pt-16 lg:py-16 lg:pt-[60px]">
      <div className="mb-10 h-10 w-40 animate-pulse rounded bg-[var(--color-line)] lg:mb-12" />
      <WorksListSkeleton />
    </div>
  );
}

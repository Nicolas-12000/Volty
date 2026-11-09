import { Skeleton, SkeletonMetric } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

const KPI_LABELS = ["Precio ahora", "Mínimo del día", "Máximo del día", "Renovables"];

export function DashboardKpiSkeleton() {
  return (
    <>
      {KPI_LABELS.map((label, i) => (
        <div
          key={label}
          className={cn(
            "flex items-end justify-between gap-2 border-hairline px-5 py-5",
            i % 2 === 0 && "border-r",
            i < 2 && "border-b lg:border-b-0",
            "lg:border-r lg:last:border-r-0",
          )}
        >
          <div className="space-y-2">
            <span className="sr-only">{label}</span>
            <Skeleton className="h-3.5 w-24" />
            <SkeletonMetric className="h-7 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-18 shrink-0 rounded-sm" />
        </div>
      ))}
    </>
  );
}

const BAR_HEIGHTS = [
  42, 68, 35, 52, 78, 48, 61, 33, 55, 72, 40, 64, 38, 58, 70, 45, 62, 36, 50, 66, 44, 59, 74, 41,
  53, 67, 39, 56, 71, 47, 63, 34, 51, 69, 43, 60, 75, 37, 54, 68, 46, 61, 73, 42, 57, 65, 49, 62,
];

export function DashboardChartSkeleton() {
  return (
    <div className="flex h-full min-h-88 flex-col space-y-3" aria-hidden="true">
      <div className="flex min-h-88 flex-1 items-end gap-px sm:gap-0.5">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="skeleton-shimmer min-w-0 flex-1 rounded-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between gap-2">
        {["00:00", "06:00", "12:00", "18:00", "24:00"].map((t) => (
          <Skeleton key={t} className="h-2.5 w-8" />
        ))}
      </div>
    </div>
  );
}

export function DashboardPlanSkeleton() {
  return (
    <div className="flex h-full min-h-88 flex-col gap-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <Skeleton className="h-14 rounded-md" />
        <Skeleton className="h-14 rounded-md" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

export function DashboardRenewableSkeleton() {
  return (
    <div className="mt-4 space-y-3" aria-hidden="true">
      <Skeleton className="h-2.5 w-full rounded-full" />
      <Skeleton className="h-3.5 w-44" />
    </div>
  );
}

export function DashboardLoadsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="mt-3 space-y-0" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center justify-between gap-3 border-b border-hairline py-3 last:border-0">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* ─── Base Skeleton ────────────────────────────────────────────────────────── */

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

/* ─── Pre-configured variants ──────────────────────────────────────────────── */

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}

export function SkeletonMetric({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-8 w-24", className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-32 w-full rounded-lg", className)} {...props} />
  );
}

export function SkeletonStrip({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-20 w-full rounded-lg", className)} {...props} />
  );
}

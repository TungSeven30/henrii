import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-6 w-32" />

      {/* Form fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}

      {/* Submit button */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

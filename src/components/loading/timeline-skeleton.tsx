import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Skeleton className="h-6 w-24" />

      {/* Filter chips */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      {/* Date group label */}
      <Skeleton className="h-4 w-16 px-1" />

      {/* 5 timeline event cards */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="py-3">
            <CardContent className="flex items-start gap-3 px-4">
              <Skeleton className="size-9 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

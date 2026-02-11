import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: avatar circle + text */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* 3 summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardContent className="flex flex-col items-center gap-2 px-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last events card: 3 rows */}
      <Card className="py-4">
        <CardContent className="space-y-3 px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5 quick-access cards in 2-col grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardContent className="flex flex-col items-center gap-2 px-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

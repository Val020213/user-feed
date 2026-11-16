import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function PostsFeedSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading posts"
      className="flex flex-col gap-3"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} size="sm">
          <CardHeader>
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { USERS_PAGE_SIZE } from "../schemas"

export function UserListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading users"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-5 w-24" />
      <div className="grid gap-3">
        {Array.from({ length: USERS_PAGE_SIZE }, (_, index) => (
          <Card key={index}>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-center md:gap-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3.5 w-1/3" />
                </div>
              </div>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, line) => (
                  <Skeleton key={line} className="h-4 w-3/4" />
                ))}
              </div>
              <Skeleton className="hidden size-5 md:block" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

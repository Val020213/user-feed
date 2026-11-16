import { UserXIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"

import { NavigationPendingReporter } from "@/lib/navigation-progress"

export default function UserNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-10">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserXIcon />
          </EmptyMedia>
          <EmptyTitle>User not found</EmptyTitle>
          <EmptyDescription>There is no user at this address.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/users" />}>
            Back to users
            <NavigationPendingReporter />
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}

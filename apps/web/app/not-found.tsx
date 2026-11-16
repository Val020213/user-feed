import { FileQuestionIcon } from "lucide-react"
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

import { StatusPage } from "@/components/status-page"
import { NavigationPendingReporter } from "@/lib/navigation-progress"

export default function NotFound() {
  return (
    <StatusPage>
      <Empty className="flex-none border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>There is nothing at this address.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link href="/users" />}>
            Go to users
            <NavigationPendingReporter />
          </Button>
        </EmptyContent>
      </Empty>
    </StatusPage>
  )
}

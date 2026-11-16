"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"
import { StatusPage } from "@/components/status-page"

export default function UserPostsError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage>
      <ErrorState
        title="We could not load this user"
        description="The server did not respond. Check your connection and try again."
        onRetry={() => retry()}
      />
    </StatusPage>
  )
}

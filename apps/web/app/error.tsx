"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"
import { StatusPage } from "@/components/status-page"

/** Any error a route does not handle itself. */
export default function AppError({
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
        title="Something went wrong"
        description="An unexpected error stopped this page. Try again in a moment."
        onRetry={() => retry()}
      />
    </StatusPage>
  )
}

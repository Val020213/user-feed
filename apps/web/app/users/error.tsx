"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"

export default function UsersError({
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
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10">
      <ErrorState
        title="We could not load the users"
        description="The server did not respond. Check your connection and try again."
        onRetry={() => retry()}
      />
    </main>
  )
}

"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"

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
    <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-10">
      <ErrorState
        title="We could not load this user"
        description="The server did not respond. Check your connection and try again."
        onRetry={() => retry()}
      />
    </main>
  )
}

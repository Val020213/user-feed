"use client"

import { useEffect } from "react"

import "@workspace/ui/globals.css"

import { ErrorState } from "@/components/error-state"
import { StatusPage } from "@/components/status-page"

/**
 * Errors in the root layout itself. It replaces that layout, so it renders its
 * own document and imports the global styles again.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className="font-sans antialiased">
        <title>Something went wrong · User Feed</title>
        <StatusPage>
          <ErrorState
            title="Something went wrong"
            description="The app could not load. Try again in a moment."
            onRetry={() => retry()}
          />
        </StatusPage>
      </body>
    </html>
  )
}

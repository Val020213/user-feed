"use client"

import { useNavigationPending } from "@/lib/navigation-progress"

/** A thin indeterminate bar at the top of the viewport while a navigation is pending. */
export function NavigationProgress() {
  const pending = useNavigationPending()
  if (!pending) return null

  return (
    <div
      data-testid="navigation-progress"
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-100 h-1.5 overflow-hidden bg-primary/25"
    >
      <div className="h-full w-1/3 animate-navigation-progress bg-primary motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  )
}

"use client"

import { useLinkStatus } from "next/link"
import { useEffect, useSyncExternalStore } from "react"

// Every pending link registers a token here; the bar shows while any remain.
// Adapted from ecommerce-base's backoffice.
const pendingSources = new Set<symbol>()
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Place inside a `<Link>` so its pending navigation drives the bar. */
export function NavigationPendingReporter() {
  const { pending } = useLinkStatus()

  useEffect(() => {
    if (!pending) return
    const source = Symbol("navigation")
    pendingSources.add(source)
    if (pendingSources.size === 1) notify()
    return () => {
      if (pendingSources.delete(source) && pendingSources.size === 0) notify()
    }
  }, [pending])

  return null
}

export function useNavigationPending() {
  return useSyncExternalStore(
    subscribe,
    () => pendingSources.size > 0,
    () => false
  )
}

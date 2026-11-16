import { useSyncExternalStore } from "react"

/**
 * Stands in for the browser URL in tests: the nuqs testing adapter writes it
 * through `onUrlUpdate`, and the `next/navigation` mock reads it.
 */
let params = new URLSearchParams()
const listeners = new Set<() => void>()

export function setUrlSearchParams(next: string | URLSearchParams) {
  params = new URLSearchParams(next)
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSearchParams() {
  return useSyncExternalStore(subscribe, () => params)
}

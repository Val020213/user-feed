import { vi } from "vitest"

type Entry = Pick<IntersectionObserverEntry, "isIntersecting" | "target">

/**
 * jsdom has no IntersectionObserver. This fake records every observer so a
 * test can decide when an element "scrolls into view".
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  readonly targets = new Set<Element>()
  disconnected = false

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit = {}
  ) {
    FakeIntersectionObserver.instances.push(this)
  }

  observe(target: Element) {
    this.targets.add(target)
  }

  unobserve(target: Element) {
    this.targets.delete(target)
  }

  disconnect() {
    this.disconnected = true
    this.targets.clear()
  }

  takeRecords() {
    return []
  }

  /** Reports `target` as visible to every live observer watching it. */
  static reveal(target: Element) {
    for (const observer of FakeIntersectionObserver.instances) {
      if (observer.disconnected || !observer.targets.has(target)) continue
      const entry: Entry = { isIntersecting: true, target }
      observer.callback(
        [entry as IntersectionObserverEntry],
        observer as unknown as IntersectionObserver
      )
    }
  }
}

export function stubIntersectionObserver() {
  FakeIntersectionObserver.instances = []
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)
}

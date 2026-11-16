import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

import {
  FakeIntersectionObserver,
  stubIntersectionObserver,
} from "./support/intersection-observer"

function query(overrides: Partial<Parameters<typeof useInfiniteScroll>[0]>) {
  return {
    hasNextPage: true,
    isFetching: false,
    isFetchingNextPage: false,
    isError: false,
    fetchNextPage: vi.fn(async () => ({ hasNextPage: true, isError: false })),
    ...overrides,
  }
}

function Trigger(props: { query: Parameters<typeof useInfiniteScroll>[0] }) {
  const { triggerRef } = useInfiniteScroll<HTMLButtonElement>(props.query)
  return <button ref={triggerRef}>Load more</button>
}

function reveal() {
  act(() => FakeIntersectionObserver.reveal(screen.getByText("Load more")))
}

beforeEach(() => {
  stubIntersectionObserver()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useInfiniteScroll", () => {
  it("loads the next page when the trigger nears the viewport", () => {
    const feed = query({})
    render(<Trigger query={feed} />)

    reveal()

    expect(feed.fetchNextPage).toHaveBeenCalledTimes(1)
    expect(FakeIntersectionObserver.instances[0]?.options.rootMargin).toBe(
      "600px 0px"
    )
  })

  it("does not watch while a page is loading, failed, or the last one", () => {
    for (const state of [
      { isFetching: true },
      { isError: true },
      { hasNextPage: false },
    ]) {
      const feed = query(state)
      const { unmount } = render(<Trigger query={feed} />)
      reveal()
      expect(feed.fetchNextPage).not.toHaveBeenCalled()
      unmount()
    }
  })

  it("calls the latest query without re-observing", () => {
    const first = query({})
    const second = query({})
    const { rerender } = render(<Trigger query={first} />)
    rerender(<Trigger query={second} />)

    reveal()

    expect(first.fetchNextPage).not.toHaveBeenCalled()
    expect(second.fetchNextPage).toHaveBeenCalledTimes(1)
    expect(FakeIntersectionObserver.instances).toHaveLength(1)
  })

  it("stops watching when the trigger unmounts", () => {
    const { unmount } = render(<Trigger query={query({})} />)

    unmount()

    expect(FakeIntersectionObserver.instances[0]?.disconnected).toBe(true)
  })

  it("does nothing where IntersectionObserver is missing", () => {
    vi.stubGlobal("IntersectionObserver", undefined)

    expect(() => render(<Trigger query={query({})} />)).not.toThrow()
  })
})

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefCallback,
} from "react"

type InfiniteQuery = {
  hasNextPage: boolean
  isFetching: boolean
  isFetchingNextPage: boolean
  isError: boolean
  fetchNextPage: () => Promise<{ hasNextPage: boolean; isError: boolean }>
}

/**
 * Loads the next page when the trigger comes within `rootMargin` of the
 * viewport. The trigger is also a button: when pressing it loads the last
 * page, focus moves to the end marker instead of being lost with the removed
 * button. Without IntersectionObserver only the button loads more.
 */
export function useInfiniteScroll<T extends HTMLElement>(
  query: InfiniteQuery,
  { rootMargin = "600px 0px" } = {}
) {
  const [trigger, setTrigger] = useState<T | null>(null)
  const focusEnd = useRef(false)
  const fetchNextPage = useEffectEvent(() => void query.fetchNextPage())
  const enabled = query.hasNextPage && !query.isFetching && !query.isError

  useEffect(() => {
    if (!trigger || !enabled || typeof IntersectionObserver === "undefined")
      return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage()
      },
      { rootMargin }
    )
    observer.observe(trigger)
    return () => observer.disconnect()
  }, [trigger, enabled, rootMargin])

  function loadMore() {
    if (query.isFetchingNextPage) return
    focusEnd.current = true
    void query.fetchNextPage().then((result) => {
      if (result.hasNextPage || result.isError) focusEnd.current = false
    })
  }

  const endRef: RefCallback<HTMLElement> = (node) => {
    if (node && focusEnd.current) {
      focusEnd.current = false
      node.focus()
    }
  }

  return { triggerRef: setTrigger, loadMore, endRef }
}

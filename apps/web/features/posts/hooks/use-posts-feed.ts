import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

import { postsFeedOptions } from "../queries"
import { useNewPostIds, usePublishingPosts } from "./use-create-post"

/**
 * The user's feed for the search in the URL, plus the posts this tab is
 * publishing or published. It reads the URL itself, not the
 * nuqs state: nuqs updates its state on every keystroke and the URL only after
 * the search's debounce, so this queries once per pause.
 */
export function usePostsFeed(userId: number) {
  const search = (useSearchParams().get("q") ?? "").trim()
  const feed = useInfiniteQuery({
    ...postsFeedOptions(userId, search),
    placeholderData: keepPreviousData,
  })

  return {
    feed,
    search,
    posts: feed.data?.pages.flatMap((page) => page.posts) ?? [],
    publishing: usePublishingPosts(userId),
    newPostIds: useNewPostIds(userId),
  }
}

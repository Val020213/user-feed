import { infiniteQueryOptions } from "@tanstack/react-query"

import { getUserPosts } from "./server-actions"

export const postsKeys = {
  all: (userId: number) => ["posts", userId] as const,
  feed: (userId: number, q: string) =>
    [...postsKeys.all(userId), { q }] as const,
}

export function postsFeedOptions(userId: number, q: string) {
  return infiniteQueryOptions({
    queryKey: postsKeys.feed(userId, q),
    queryFn: async ({ pageParam }) => {
      const result = await getUserPosts({ userId, q, page: pageParam })
      if (!result.ok) throw new Error(result.error.message)
      return result.page
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

import { resolveUserId } from "@/features/users/utils/user-id"

import { PostsFeed } from "./posts-feed"
import { PostsSearch } from "./posts-search"

export async function UserPosts({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const userId = await resolveUserId(params)

  return (
    <section aria-labelledby="posts-heading" className="flex flex-col gap-4">
      <h2 id="posts-heading" className="font-heading text-lg font-medium">
        Posts
      </h2>
      <PostsSearch />
      <PostsFeed userId={userId} />
    </section>
  )
}

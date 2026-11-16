import { resolveUserId } from "@/features/users/utils/user-id"

import { NewPostButton } from "./new-post-button"
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
      <div className="flex items-center justify-between gap-3">
        <h2 id="posts-heading" className="font-heading text-lg font-medium">
          Posts
        </h2>
        <NewPostButton userId={userId} />
      </div>
      <PostsSearch />
      <PostsFeed userId={userId} />
    </section>
  )
}

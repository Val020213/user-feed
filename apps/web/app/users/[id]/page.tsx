import { Suspense } from "react"

import { PostsFeedSkeleton } from "@/features/posts/components/posts-feed-skeleton"
import { UserPosts } from "@/features/posts/components/user-posts"
import {
  BackToUsers,
  UserHeader,
  UserHeaderSkeleton,
} from "@/features/users/components/user-header"

export default function UserPostsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <BackToUsers />
      <Suspense fallback={<UserHeaderSkeleton />}>
        <UserHeader params={params} />
      </Suspense>
      <Suspense fallback={<PostsFeedSkeleton />}>
        <UserPosts params={params} />
      </Suspense>
    </main>
  )
}

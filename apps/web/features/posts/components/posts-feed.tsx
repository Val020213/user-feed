"use client"

import { FileTextIcon, SearchXIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Spinner } from "@workspace/ui/components/spinner"

import { ErrorState } from "@/components/error-state"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

import { usePostsFeed } from "../hooks/use-posts-feed"
import { PostCard } from "./post-card"
import { PostsFeedSkeleton } from "./posts-feed-skeleton"

export function PostsFeed({ userId }: { userId: number }) {
  const { feed, search, posts } = usePostsFeed(userId)
  const { triggerRef, loadMore, endRef } =
    useInfiniteScroll<HTMLButtonElement>(feed)

  const error = feed.isError ? (
    <ErrorState
      title="We could not load the posts"
      description={feed.error.message}
      onRetry={() =>
        void (feed.isFetchNextPageError ? feed.fetchNextPage() : feed.refetch())
      }
    />
  ) : null

  function renderFooter() {
    if (feed.isPending) return <PostsFeedSkeleton />
    if (feed.isPlaceholderData) return null
    if (error) return error
    if (!feed.hasNextPage) {
      return (
        <p
          ref={endRef}
          tabIndex={-1}
          className="py-2 text-center text-sm text-muted-foreground outline-none"
        >
          You&apos;ve reached the end
        </p>
      )
    }
    return (
      <Button
        ref={triggerRef}
        variant="outline"
        size="sm"
        className="self-center"
        aria-disabled={feed.isFetchingNextPage}
        onClick={loadMore}
      >
        {feed.isFetchingNextPage ? (
          <>
            <Spinner data-icon="inline-start" /> Loading…
          </>
        ) : (
          "Load more"
        )}
      </Button>
    )
  }

  if (feed.isPending) return <PostsFeedSkeleton />

  if (feed.isLoadingError) return error

  if (feed.isSuccess && posts.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {search ? <SearchXIcon /> : <FileTextIcon />}
          </EmptyMedia>
          <EmptyTitle>{search ? "No posts match" : "No posts yet"}</EmptyTitle>
          <EmptyDescription>
            {search
              ? `No post mentions "${search}". Try another word.`
              : "This user has not written anything yet."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div
      aria-busy={feed.isPlaceholderData}
      className="flex flex-col gap-3 transition-opacity aria-busy:opacity-60"
    >
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard title={post.title} body={post.body} />
          </li>
        ))}
      </ul>

      <div aria-live="polite" className="flex flex-col">
        {renderFooter()}
      </div>
    </div>
  )
}

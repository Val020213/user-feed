"use server"

import { z } from "zod"

import { ApiError, apiGet, apiPost } from "@/lib/jsonplaceholder"

import { findPosts, savePost } from "./post-store"
import {
  createPostInputSchema,
  POSTS_PAGE_SIZE,
  postSchema,
  type CreatePostInput,
  type CreatePostResult,
  type UserPostsResult,
} from "./schemas"

function failure(error: unknown) {
  return {
    ok: false as const,
    error: {
      message:
        error instanceof ApiError ? error.message : "Something went wrong.",
    },
  }
}

/**
 * Loads one page of a user's posts: the ones published here first, then the
 * API's. `q` filters both, and like the API's it also matches ids.
 */
export async function getUserPosts({
  userId,
  q,
  page,
}: {
  userId: number
  q: string
  page: number
}): Promise<UserPostsResult> {
  const term = q.trim()
  const stored = findPosts(userId, term)
  const start = (page - 1) * POSTS_PAGE_SIZE
  const fromStore = stored.slice(start, start + POSTS_PAGE_SIZE)

  try {
    const { data, total } = await apiGet("/posts", z.array(postSchema), {
      userId,
      q: term || undefined,
      _start: Math.max(0, start - stored.length),
      _limit: POSTS_PAGE_SIZE - fromStore.length,
    })

    const count = stored.length + (total ?? data.length)
    return {
      ok: true,
      page: {
        posts: [...fromStore, ...data],
        total: count,
        nextPage: start + POSTS_PAGE_SIZE < count ? page + 1 : undefined,
      },
    }
  } catch (error) {
    return failure(error)
  }
}

/** Publishes a post once JSONPlaceholder accepts it, then stores it here. */
export async function createPost(
  input: CreatePostInput
): Promise<CreatePostResult> {
  const parsed = createPostInputSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const field = issue?.path[0]
    return {
      ok: false,
      error: {
        message: issue?.message ?? "The post is not valid.",
        field: field === "title" || field === "body" ? field : undefined,
      },
    }
  }

  const post = parsed.data
  try {
    await apiPost("/posts", post)
  } catch (error) {
    return failure(error)
  }

  return { ok: true, post: savePost(post) }
}

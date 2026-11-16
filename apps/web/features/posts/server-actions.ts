"use server"

import { z } from "zod"

import { ApiError, apiGet } from "@/lib/jsonplaceholder"

import { POSTS_PAGE_SIZE, postSchema, type UserPostsResult } from "./schemas"

/** Loads one page of a user's posts. `q` matches any field, as the API's does. */
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
  const start = (page - 1) * POSTS_PAGE_SIZE

  try {
    const { data, total } = await apiGet("/posts", z.array(postSchema), {
      userId,
      q: term || undefined,
      _start: start,
      _limit: POSTS_PAGE_SIZE,
    })

    const count = total ?? data.length
    return {
      ok: true,
      page: {
        posts: data,
        total: count,
        nextPage: start + POSTS_PAGE_SIZE < count ? page + 1 : undefined,
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        message:
          error instanceof ApiError ? error.message : "Something went wrong.",
      },
    }
  }
}

import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query"

import { postsKeys } from "../queries"
import type { CreatePostValues, Post } from "../schemas"
import { createPost } from "../server-actions"

export class CreatePostError extends Error {
  constructor(
    message: string,
    readonly field?: keyof CreatePostValues
  ) {
    super(message)
    this.name = "CreatePostError"
  }
}

const createPostKey = (userId: number) => ["create-post", userId] as const

/**
 * Publishes a post, then refetches the feed so the server places and filters
 * it. The mutation stays pending until that refetch lands.
 */
export function useCreatePost(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: createPostKey(userId),
    mutationFn: async (values: CreatePostValues) => {
      const result = await createPost({ userId, ...values })
      if (!result.ok)
        throw new CreatePostError(result.error.message, result.error.field)
      return result.post
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: postsKeys.all(userId) }),
  })
}

/** Posts still on their way to the server, newest first. */
export function usePublishingPosts(userId: number) {
  return useMutationState({
    filters: { mutationKey: createPostKey(userId), status: "pending" },
    select: (mutation) => ({
      key: mutation.mutationId,
      ...(mutation.state.variables as CreatePostValues),
    }),
  }).reverse()
}

/** Ids of the posts this tab published, to mark them as new. */
export function useNewPostIds(userId: number) {
  return useMutationState({
    filters: { mutationKey: createPostKey(userId), status: "success" },
    select: (mutation) => (mutation.state.data as Post).id,
  })
}

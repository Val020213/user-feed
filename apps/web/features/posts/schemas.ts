import { z } from "zod"

export const postSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
})

export type Post = z.infer<typeof postSchema>

export const POSTS_PAGE_SIZE = 4

type PostsPage = {
  posts: Post[]
  total: number
  nextPage: number | undefined
}

/**
 * Server Actions return failures instead of throwing: Next strips the message
 * of a thrown error in production, and the UI needs it.
 */
type ActionResult<Data> =
  | ({ ok: true } & Data)
  | {
      ok: false
      error: { message: string }
    }

export type UserPostsResult = ActionResult<{ page: PostsPage }>

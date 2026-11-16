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

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Keep the title under 120 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Body is required")
    .max(2000, "Keep the body under 2000 characters"),
})

export type CreatePostValues = z.infer<typeof createPostSchema>

/** What `createPost` accepts: the form's values plus their author. */
export const createPostInputSchema = createPostSchema.extend({
  userId: z
    .int({ error: "Unknown user." })
    .positive({ error: "Unknown user." }),
})

export type CreatePostInput = z.input<typeof createPostInputSchema>

/**
 * Server Actions return failures instead of throwing: Next strips the message
 * of a thrown error in production, and the UI needs it.
 */
type ActionResult<Data> =
  | ({ ok: true } & Data)
  | {
      ok: false
      error: { message: string; field?: keyof CreatePostValues }
    }

export type CreatePostResult = ActionResult<{ post: Post }>

export type UserPostsResult = ActionResult<{ page: PostsPage }>

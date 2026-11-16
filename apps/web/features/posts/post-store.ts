import type { Post } from "./schemas"

// JSONPlaceholder accepts a POST but stores nothing, so this module plays the
// database. It lives in the server process: shared by every visitor, lost on
// restart, and not shared between instances.
const posts: Post[] = []
let nextId = 101

export function savePost(post: Omit<Post, "id">): Post {
  const saved = { id: nextId++, ...post }
  posts.unshift(saved)
  return saved
}

/** Newest first. `q` mirrors the API's: a case-insensitive match on any field. */
export function findPosts(userId: number, q: string): Post[] {
  const term = q.toLowerCase()
  return posts.filter(
    (post) =>
      post.userId === userId &&
      (!term ||
        Object.values(post).some((value) =>
          String(value).toLowerCase().includes(term)
        ))
  )
}

export function resetPostStore() {
  posts.length = 0
  nextId = 101
}

import { notFound } from "next/navigation"

/** Parses a route segment as a user id, or returns null when it is not one. */
function parseUserId(segment: string) {
  if (!/^[1-9]\d*$/.test(segment)) return null
  const id = Number(segment)
  return Number.isSafeInteger(id) ? id : null
}

/** Resolves the `[id]` route param to a user id, or renders the 404 page. */
export async function resolveUserId(params: Promise<{ id: string }>) {
  const userId = parseUserId((await params).id)
  if (userId === null) notFound()
  return userId
}

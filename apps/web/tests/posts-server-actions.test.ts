import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { resetPostStore } from "@/features/posts/post-store"
import { POSTS_PAGE_SIZE } from "@/features/posts/schemas"
import { createPost, getUserPosts } from "@/features/posts/server-actions"

function post(id: number) {
  return { userId: 1, id, title: `title ${id}`, body: `body ${id}` }
}

function stubFetch(body: unknown, init: ResponseInit = {}) {
  const fetchMock = vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json", ...init.headers },
        ...init,
      })
  )
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

beforeEach(() => {
  resetPostStore()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** A fake JSONPlaceholder holding `total` posts for user 1. */
function stubPagedApi(total: number) {
  const all = Array.from({ length: total }, (_, i) => post(i + 1))
  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    if (init?.method === "POST") return new Response("{}", { status: 201 })
    const url = new URL(String(input))
    const start = Number(url.searchParams.get("_start"))
    const limit = Number(url.searchParams.get("_limit"))
    return new Response(JSON.stringify(all.slice(start, start + limit)), {
      headers: { "X-Total-Count": String(total) },
    })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

async function publish(title: string) {
  const result = await createPost({ userId: 1, title, body: "body" })
  if (!result.ok) throw new Error(result.error.message)
  return result.post
}

describe("getUserPosts", () => {
  it("returns the next page while more posts remain", async () => {
    stubFetch([post(1), post(2), post(3), post(4)], {
      headers: { "X-Total-Count": "10" },
    })

    const result = await getUserPosts({ userId: 1, q: "", page: 1 })

    expect(result).toMatchObject({ ok: true, page: { total: 10, nextPage: 2 } })
    expect(result.ok && result.page.posts).toHaveLength(4)
  })

  it("returns no next page on the last page", async () => {
    stubFetch([post(9), post(10)], { headers: { "X-Total-Count": "10" } })

    const result = await getUserPosts({ userId: 1, q: "", page: 3 })

    expect(result.ok && result.page.posts.map((p) => p.id)).toEqual([9, 10])
    expect(result.ok && result.page.nextPage).toBeUndefined()
  })

  it("sends the search term and page size to the API", async () => {
    const fetchMock = stubFetch([], { headers: { "X-Total-Count": "0" } })

    await getUserPosts({ userId: 7, q: "abc", page: 2 })

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.pathname).toBe("/posts")
    expect(url.searchParams.get("userId")).toBe("7")
    expect(url.searchParams.get("q")).toBe("abc")
    expect(url.searchParams.get("_start")).toBe(String(POSTS_PAGE_SIZE))
    expect(url.searchParams.get("_limit")).toBe(String(POSTS_PAGE_SIZE))
  })

  it("omits the search param when the term is blank", async () => {
    const fetchMock = stubFetch([], { headers: { "X-Total-Count": "0" } })

    await getUserPosts({ userId: 1, q: "   ", page: 1 })

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.searchParams.has("q")).toBe(false)
  })

  it("explains a request that timed out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation timed out.", "TimeoutError")
      })
    )

    const result = await getUserPosts({ userId: 1, q: "", page: 1 })

    expect(result).toEqual({
      ok: false,
      error: { message: "The server took too long to answer. Try again." },
    })
  })

  it("returns the failure instead of throwing when the API fails", async () => {
    stubFetch({}, { status: 500 })

    await expect(getUserPosts({ userId: 1, q: "", page: 1 })).resolves.toEqual({
      ok: false,
      error: { message: "Request failed with status 500." },
    })
  })
})

describe("posts published here", () => {
  it("come first, newest first, and pages continue into the API's posts", async () => {
    stubPagedApi(5)
    const first = await publish("first")
    const second = await publish("second")
    const third = await publish("third")

    const page1 = await getUserPosts({ userId: 1, q: "", page: 1 })
    const page2 = await getUserPosts({ userId: 1, q: "", page: 2 })

    expect(page1.ok && page1.page.posts.map((p) => p.id)).toEqual([
      third.id,
      second.id,
      first.id,
      1,
    ])
    expect(page2.ok && page2.page.posts.map((p) => p.id)).toEqual([2, 3, 4, 5])
    expect(page2.ok && page2.page).toMatchObject({
      total: 8,
      nextPage: undefined,
    })
  })

  it("are filtered by the search like the API's posts", async () => {
    stubPagedApi(0)
    await publish("Hello there")
    await publish("Goodbye")

    const result = await getUserPosts({ userId: 1, q: "hello", page: 1 })

    expect(result.ok && result.page.posts.map((p) => p.title)).toEqual([
      "Hello there",
    ])
  })

  it("belong only to their author", async () => {
    stubPagedApi(0)
    await publish("Mine")

    const result = await getUserPosts({ userId: 2, q: "", page: 1 })

    expect(result.ok && result.page.posts).toEqual([])
  })
})

describe("createPost", () => {
  it("posts the trimmed values and hands out increasing ids", async () => {
    const fetchMock = stubFetch({ id: 101 }, { status: 201 })

    const first = await createPost({ userId: 3, title: " Hi ", body: "There" })
    const second = await createPost({ userId: 3, title: "Again", body: "Yes" })

    expect(first).toEqual({
      ok: true,
      post: { id: expect.any(Number), userId: 3, title: "Hi", body: "There" },
    })
    expect(first.ok && second.ok && second.post.id - first.post.id).toBe(1)
    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.method).toBe("POST")
    expect(JSON.parse(String(init?.body))).toEqual({
      userId: 3,
      title: "Hi",
      body: "There",
    })
  })

  it("rejects an empty field without calling the API", async () => {
    const fetchMock = stubFetch({})

    const result = await createPost({ userId: 1, title: "  ", body: "x" })

    expect(result).toEqual({
      ok: false,
      error: { message: "Title is required", field: "title" },
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects an unknown user without calling the API", async () => {
    const fetchMock = stubFetch({})

    const result = await createPost({ userId: 0, title: "A", body: "B" })

    expect(result).toEqual({
      ok: false,
      error: { message: "Unknown user.", field: undefined },
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("reports a failed API call", async () => {
    stubFetch({}, { status: 503 })

    const result = await createPost({ userId: 1, title: "A", body: "B" })

    expect(result).toEqual({
      ok: false,
      error: { message: "Request failed with status 503." },
    })
  })
})

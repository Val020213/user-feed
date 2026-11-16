import { afterEach, describe, expect, it, vi } from "vitest"

import { POSTS_PAGE_SIZE } from "@/features/posts/schemas"
import { getUserPosts } from "@/features/posts/server-actions"

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

afterEach(() => {
  vi.unstubAllGlobals()
})

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

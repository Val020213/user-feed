import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { withNuqsTestingAdapter } from "nuqs/adapters/testing"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PostsFeed } from "@/features/posts/components/posts-feed"
import { PostsSearch } from "@/features/posts/components/posts-search"

import {
  FakeIntersectionObserver,
  stubIntersectionObserver,
} from "./support/intersection-observer"
import { setUrlSearchParams } from "./support/search-params"

vi.mock("next/navigation", () => import("./support/search-params"))

const TOTAL = 10

function post(id: number) {
  return { userId: 1, id, title: `Post title ${id}`, body: `Post body ${id}` }
}

const ALL_POSTS = Array.from({ length: TOTAL }, (_, i) => post(i + 1))

type Handler = (url: URL) => Response

function json(body: unknown, total: number) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "X-Total-Count": String(total),
    },
  })
}

function stubApi(handler: Handler) {
  const fetchMock = vi.fn<typeof fetch>(async (input) =>
    handler(new URL(String(input)))
  )
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function pagedApi(url: URL) {
  const start = Number(url.searchParams.get("_start"))
  const limit = Number(url.searchParams.get("_limit"))
  return json(ALL_POSTS.slice(start, start + limit), TOTAL)
}

function renderFeed(searchParams = "") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  setUrlSearchParams(searchParams)
  const Nuqs = withNuqsTestingAdapter({
    searchParams,
    hasMemory: true,
    onUrlUpdate: (event) => setUrlSearchParams(event.searchParams),
  })
  render(
    <QueryClientProvider client={queryClient}>
      <Nuqs>
        <PostsSearch />
        <PostsFeed userId={1} />
      </Nuqs>
    </QueryClientProvider>
  )
  return queryClient
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("PostsFeed", () => {
  it("shows the first page after loading", async () => {
    stubApi(pagedApi)
    renderFeed()

    expect(
      screen.getByRole("status", { name: "Loading posts" })
    ).toBeInTheDocument()
    expect(await screen.findByText("Post title 1")).toBeInTheDocument()
    expect(screen.getByText("Post title 4")).toBeInTheDocument()
    expect(screen.queryByText("Post title 5")).not.toBeInTheDocument()
  })

  it("loads more pages until the end of the list", async () => {
    const user = userEvent.setup()
    stubApi(pagedApi)
    renderFeed()

    await user.click(await screen.findByRole("button", { name: "Load more" }))
    expect(await screen.findByText("Post title 8")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Load more" }))
    expect(await screen.findByText("Post title 10")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Load more" })
    ).not.toBeInTheDocument()
    // Focus moves off the removed button so keyboard users keep their place.
    expect(screen.getByText("You've reached the end")).toHaveFocus()
  })

  it("recovers from a failed first load when the reader retries", async () => {
    const user = userEvent.setup()
    let fail = true
    stubApi((url) =>
      fail ? new Response("{}", { status: 500 }) : pagedApi(url)
    )
    renderFeed()

    expect(
      await screen.findByText("We could not load the posts")
    ).toBeInTheDocument()

    fail = false
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(await screen.findByText("Post title 1")).toBeInTheDocument()
  })

  it("keeps loaded posts when a later page fails", async () => {
    const user = userEvent.setup()
    stubApi((url) =>
      url.searchParams.get("_start") === "4"
        ? new Response("{}", { status: 500 })
        : pagedApi(url)
    )
    renderFeed()

    await user.click(await screen.findByRole("button", { name: "Load more" }))

    expect(
      await screen.findByText("We could not load the posts")
    ).toBeInTheDocument()
    expect(screen.getByText("Post title 1")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument()
  })

  it("keeps the posts on screen when a background refresh fails", async () => {
    const user = userEvent.setup()
    let fail = false
    stubApi((url) =>
      fail ? new Response("{}", { status: 500 }) : pagedApi(url)
    )
    const queryClient = renderFeed()
    expect(await screen.findByText("Post title 1")).toBeInTheDocument()

    fail = true
    await act(() => queryClient.refetchQueries())

    expect(
      await screen.findByText("We could not load the posts")
    ).toBeInTheDocument()
    expect(screen.getByText("Post title 1")).toBeInTheDocument()

    fail = false
    await user.click(screen.getByRole("button", { name: "Try again" }))
    await waitFor(() =>
      expect(
        screen.queryByText("We could not load the posts")
      ).not.toBeInTheDocument()
    )
    expect(screen.getByText("Post title 1")).toBeInTheDocument()
  })

  it("explains when the search matches no posts", async () => {
    const fetchMock = stubApi(() => json([], 0))
    renderFeed("?q=zzz")

    expect(await screen.findByText("No posts match")).toBeInTheDocument()
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.searchParams.get("q")).toBe("zzz")
  })

  it("sends one search after a pause in typing, and none after clearing", async () => {
    const user = userEvent.setup()
    const fetchMock = stubApi(pagedApi)
    renderFeed()
    await screen.findByText("Post title 1")
    const search = screen.getByRole("searchbox", { name: "Search posts" })

    await user.type(search, "title")
    await waitFor(() =>
      expect(String(fetchMock.mock.lastCall?.[0])).toContain("q=title")
    )
    const searches = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes("q=")
    )
    expect(searches).toHaveLength(1)

    await user.clear(search)
    await waitFor(() =>
      expect(String(fetchMock.mock.lastCall?.[0])).not.toContain("q=")
    )
  })

  it("explains when the user has no posts", async () => {
    stubApi(() => json([], 0))
    renderFeed()

    await waitFor(() =>
      expect(screen.getByText("No posts yet")).toBeInTheDocument()
    )
  })

  it("loads the next page on its own when Load more scrolls into view", async () => {
    stubIntersectionObserver()
    stubApi(pagedApi)
    renderFeed()
    await screen.findByText("Post title 4")

    act(() =>
      FakeIntersectionObserver.reveal(
        screen.getByRole("button", { name: "Load more" })
      )
    )

    expect(await screen.findByText("Post title 8")).toBeInTheDocument()
  })

  it("keeps focus in the search box after an earlier Load more", async () => {
    const user = userEvent.setup()
    stubApi((url) =>
      url.searchParams.get("q") ? json([post(1)], 1) : pagedApi(url)
    )
    renderFeed()
    await user.click(await screen.findByRole("button", { name: "Load more" }))
    await screen.findByText("Post title 8")

    const search = screen.getByRole("searchbox", { name: "Search posts" })
    await user.type(search, "title 1")
    await screen.findByText("You've reached the end")

    expect(search).toHaveFocus()
  })
})

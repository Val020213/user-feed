import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Toaster } from "@workspace/ui/components/sonner"

import { NewPostButton } from "@/features/posts/components/new-post-button"
import { PostsFeed } from "@/features/posts/components/posts-feed"
import { PostsSearch } from "@/features/posts/components/posts-search"
import { resetPostStore } from "@/features/posts/post-store"
import { createPost } from "@/features/posts/server-actions"

import { withTestUrl } from "./support/search-params"

vi.mock("next/navigation", () => import("./support/search-params"))

// The real actions and store run; only the network is faked. The spy counts
// calls to createPost.
vi.mock("@/features/posts/server-actions", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/posts/server-actions")>()
  return { ...actual, createPost: vi.fn(actual.createPost) }
})

const createPostSpy = vi.mocked(createPost)

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function serverPosts(url: URL) {
  const q = url.searchParams.get("q")
  const posts = q
    ? []
    : [{ userId: 1, id: 1, title: "Existing post", body: "Already here" }]
  const start = Number(url.searchParams.get("_start"))
  const limit = Number(url.searchParams.get("_limit"))
  return new Response(JSON.stringify(posts.slice(start, start + limit)), {
    headers: {
      "Content-Type": "application/json",
      "X-Total-Count": String(posts.length),
    },
  })
}

/** How JSONPlaceholder answers the next POSTs; it echoes and stores nothing. */
let answerPost: () => Promise<Response>
const created = () => Promise.resolve(new Response("{}", { status: 201 }))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Nuqs = withTestUrl()
  render(
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Nuqs>
        <NewPostButton userId={1} />
        <PostsSearch />
        <PostsFeed userId={1} />
      </Nuqs>
    </QueryClientProvider>
  )
}

/**
 * jsdom has no matchMedia, which `useIsMobile` and Sonner's Toaster use. This
 * sets the width `useIsMobile` reads and lets a test fire a resize.
 */
function stubViewport(width: number) {
  type Listener = (event: { matches: boolean }) => void
  const listeners = new Set<Listener>()
  vi.stubGlobal("innerWidth", width)
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, listener: Listener) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: Listener) =>
        listeners.delete(listener),
    }))
  )
  return {
    resize(next: number) {
      vi.stubGlobal("innerWidth", next)
      act(() => listeners.forEach((listener) => listener({ matches: false })))
    },
  }
}

async function fillAndSubmit(title: string, body: string) {
  const user = userEvent.setup()
  if (!screen.queryByRole("dialog", { name: "New post" }))
    await user.click(screen.getByRole("button", { name: "New post" }))
  if (title) await user.type(screen.getByLabelText("Title"), title)
  if (body) await user.type(screen.getByLabelText("Body"), body)
  await user.click(screen.getByRole("button", { name: "Publish" }))
  return user
}

beforeEach(() => {
  resetPostStore()
  createPostSpy.mockClear()
  answerPost = created
  stubViewport(1280)
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (input, init) =>
      init?.method === "POST"
        ? answerPost()
        : serverPosts(new URL(String(input)))
    )
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("CreatePostForm", () => {
  it("requires a title and a body before calling the server", async () => {
    renderPage()

    await fillAndSubmit("", "")

    expect(await screen.findByText("Title is required")).toBeInTheDocument()
    expect(screen.getByText("Body is required")).toBeInTheDocument()
    expect(createPostSpy).not.toHaveBeenCalled()
  })

  it("treats whitespace-only fields as empty", async () => {
    renderPage()

    await fillAndSubmit("   ", "   ")

    expect(await screen.findByText("Title is required")).toBeInTheDocument()
    expect(screen.getByText("Body is required")).toBeInTheDocument()
    expect(createPostSpy).not.toHaveBeenCalled()
  })

  it("shows the new post at the top right away and closes the dialog once sent", async () => {
    const response = deferred<Response>()
    answerPost = () => response.promise
    renderPage()
    await screen.findByText("Existing post")

    await fillAndSubmit("My new post", "Hello world")

    const items = await screen.findAllByRole("listitem", { hidden: true })
    expect(within(items[0]!).getByText("My new post")).toBeInTheDocument()
    expect(within(items[0]!).getByText("Sending…")).toBeInTheDocument()

    response.resolve(new Response("{}", { status: 201 }))

    await waitFor(() =>
      expect(screen.queryByText("Sending…")).not.toBeInTheDocument()
    )
    expect(
      await screen.findByText("Post created successfully")
    ).toBeInTheDocument()
    // The row now comes back from the server's feed, marked as new.
    // Toasts are list items too; take the first post card's row.
    const first = document
      .querySelector("li [data-slot=card-title]")!
      .closest("li")!
    expect(within(first).getByText("My new post")).toBeInTheDocument()
    expect(within(first).getByText("New")).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "New post" })
      ).not.toBeInTheDocument()
    )
    expect(createPostSpy).toHaveBeenCalledWith({
      userId: 1,
      title: "My new post",
      body: "Hello world",
    })
  })

  it("puts each new post above the previous one", async () => {
    renderPage()
    await screen.findByText("Existing post")

    await fillAndSubmit("First new post", "One")
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "New post" })
      ).not.toBeInTheDocument()
    )
    await fillAndSubmit("Second new post", "Two")

    await waitFor(() => {
      // Toasts are list items too; keep only the post cards.
      const titles = Array.from(
        document.querySelectorAll("li [data-slot=card-title]"),
        (title) => title.textContent
      )
      expect(titles).toEqual([
        "Second new post",
        "First new post",
        "Existing post",
      ])
    })
  })

  it("filters new posts with the search on the server, like the API's own", async () => {
    renderPage()
    await screen.findByText("Existing post")
    const user = await fillAndSubmit("Hello", "Greetings")
    await screen.findByText("Hello")

    await user.type(
      screen.getByRole("searchbox", { name: "Search posts" }),
      "zzz"
    )
    await waitFor(() =>
      expect(screen.queryByText("Hello")).not.toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(await screen.findByText("Hello")).toBeInTheDocument()
  })

  it("keeps the draft and explains the failure in a toast when the server rejects it", async () => {
    answerPost = () => Promise.resolve(new Response("{}", { status: 500 }))
    renderPage()
    await screen.findByText("Existing post")

    await fillAndSubmit("Doomed post", "Nope")

    expect(
      await screen.findByText("Request failed with status 500.")
    ).toBeInTheDocument()
    expect(
      screen.getByText("We could not publish the post")
    ).toBeInTheDocument()
    expect(screen.queryByText("Doomed post")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("Doomed post")
  })

  it("sends the post only once when Publish is clicked twice", async () => {
    const response = deferred<Response>()
    answerPost = () => response.promise
    renderPage()
    await screen.findByText("Existing post")

    const user = await fillAndSubmit("Once", "Only once")
    await user.click(screen.getByRole("button", { name: /Publish|Publishing/ }))
    response.resolve(new Response("{}", { status: 201 }))

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "New post" })
      ).not.toBeInTheDocument()
    )
    expect(createPostSpy).toHaveBeenCalledTimes(1)
  })

  it("opens the form in a drawer on small screens", async () => {
    stubViewport(390)
    renderPage()
    await screen.findByText("Existing post")

    await fillAndSubmit("From my phone", "Hi")

    expect(await screen.findByText("From my phone")).toBeInTheDocument()
    expect(createPostSpy).toHaveBeenCalledTimes(1)
  })

  it("keeps the draft when the dialog turns into a drawer while open", async () => {
    const viewport = stubViewport(1280)
    renderPage()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "New post" }))
    await user.type(screen.getByLabelText("Title"), "Half written")

    expect(document.querySelector("[data-slot=drawer-content]")).toBeNull()
    viewport.resize(390)

    expect(
      document.querySelector("[data-slot=drawer-content]")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("Half written")
  })

  it("closes at once on Cancel when nothing was written", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("button", { name: "New post" }))

    await user.click(screen.getByRole("button", { name: "Cancel" }))

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "New post" })
      ).not.toBeInTheDocument()
    )
    expect(
      screen.queryByRole("alertdialog", { name: "Discard your changes?" })
    ).not.toBeInTheDocument()
  })

  it("asks before discarding a draft, and keeps it when the reader goes back", async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole("button", { name: "New post" }))
    await user.type(screen.getByLabelText("Title"), "Half written")

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    const confirm = await screen.findByRole("alertdialog", {
      name: "Discard your changes?",
    })
    await user.click(
      within(confirm).getByRole("button", { name: "Keep editing" })
    )

    expect(screen.getByLabelText("Title")).toHaveValue("Half written")

    await user.keyboard("{Escape}")
    await user.click(await screen.findByRole("button", { name: "Discard" }))
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "New post" })
      ).not.toBeInTheDocument()
    )

    await user.click(screen.getByRole("button", { name: "New post" }))
    expect(screen.getByLabelText("Title")).toHaveValue("")
  })

  it("stays open while publishing so a failure is never missed", async () => {
    const response = deferred<Response>()
    answerPost = () => response.promise
    renderPage()
    await screen.findByText("Existing post")

    const user = await fillAndSubmit("Risky post", "Might fail")
    await user.keyboard("{Escape}")
    expect(screen.getByRole("dialog", { name: "New post" })).toBeInTheDocument()

    response.resolve(new Response("{}", { status: 500 }))

    expect(
      await screen.findByText("Request failed with status 500.")
    ).toBeInTheDocument()
    expect(screen.getByRole("dialog", { name: "New post" })).toBeInTheDocument()
  })
})

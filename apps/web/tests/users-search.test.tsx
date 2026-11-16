import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  withNuqsTestingAdapter,
  type OnUrlUpdateFunction,
} from "nuqs/adapters/testing"
import { describe, expect, it, vi } from "vitest"

import { UsersSearch } from "@/features/users/components/users-search"

function renderSearch(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
  render(<UsersSearch />, {
    wrapper: withNuqsTestingAdapter({ searchParams, onUrlUpdate }),
  })
  return onUrlUpdate
}

function lastQueryString(onUrlUpdate: ReturnType<typeof renderSearch>) {
  return onUrlUpdate.mock.lastCall?.[0].queryString
}

describe("UsersSearch", () => {
  it("writes the search to the URL and returns to the first page", async () => {
    const user = userEvent.setup()
    const onUrlUpdate = renderSearch("?page=2")

    await user.type(
      screen.getByRole("searchbox", { name: "Search users by name" }),
      "cle"
    )

    await waitFor(() => expect(lastQueryString(onUrlUpdate)).toBe("?q=cle"))
  })

  it("shows the current search from the URL", () => {
    renderSearch("?q=lean")

    expect(
      screen.getByRole("searchbox", { name: "Search users by name" })
    ).toHaveValue("lean")
  })

  it("removes the search from the URL when cleared", async () => {
    const user = userEvent.setup()
    const onUrlUpdate = renderSearch("?q=lean&page=2")

    await user.click(screen.getByRole("button", { name: "Clear search" }))

    await waitFor(() => expect(lastQueryString(onUrlUpdate)).toBe(""))
    expect(
      screen.getByRole("searchbox", { name: "Search users by name" })
    ).toHaveValue("")
  })
})

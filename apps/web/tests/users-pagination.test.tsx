import { render, screen } from "@testing-library/react"
import { withNuqsTestingAdapter } from "nuqs/adapters/testing"
import { describe, expect, it } from "vitest"

import { UsersPagination } from "@/features/users/components/users-pagination"

function renderPagination(page: number, totalPages: number) {
  render(<UsersPagination page={page} totalPages={totalPages} />, {
    wrapper: withNuqsTestingAdapter({
      searchParams: page > 1 ? `?page=${page}` : "",
    }),
  })
  return {
    previous: screen.getByLabelText("Go to previous page"),
    next: screen.getByLabelText("Go to next page"),
  }
}

describe("UsersPagination", () => {
  it("keeps Previous on the first page but disables it", () => {
    const { previous, next } = renderPagination(1, 2)

    expect(previous).toHaveAttribute("aria-disabled", "true")
    expect(previous).not.toHaveAttribute("href")
    expect(next).toHaveAttribute("href", "/users?page=2")
  })

  it("keeps Next on the last page but disables it", () => {
    const { previous, next } = renderPagination(2, 2)

    expect(previous).toHaveAttribute("href", "/users")
    expect(next).toHaveAttribute("aria-disabled", "true")
    expect(next).not.toHaveAttribute("href")
  })

  it("marks the current page", () => {
    renderPagination(2, 3)

    expect(screen.getByLabelText("Page 2")).toHaveAttribute(
      "aria-current",
      "page"
    )
  })
})

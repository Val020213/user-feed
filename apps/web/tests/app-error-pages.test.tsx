import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import AppError from "@/app/error"
import NotFound from "@/app/not-found"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("app error pages", () => {
  it("sends an unknown address back to the users list", () => {
    render(<NotFound />)

    expect(screen.getByText("Page not found")).toBeInTheDocument()
    expect(screen.getByText("Go to users").closest("a")).toHaveAttribute(
      "href",
      "/users"
    )
  })

  it("logs an unhandled error and retries the page", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const retry = vi.fn()
    const error = new Error("boom")
    render(<AppError error={error} retry={retry} />)

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(log).toHaveBeenCalledWith(error)

    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})

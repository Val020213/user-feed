import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { NavigationProgress } from "@/components/navigation-progress"
import { NavigationPendingReporter } from "@/lib/navigation-progress"

const linkStatus = vi.hoisted(() => ({ pending: false }))

vi.mock("next/link", () => ({ useLinkStatus: () => linkStatus }))

function App() {
  return (
    <>
      <NavigationProgress />
      <NavigationPendingReporter />
    </>
  )
}

describe("NavigationProgress", () => {
  beforeEach(() => {
    linkStatus.pending = false
  })

  it("shows the bar while a link navigation is pending and hides it after", () => {
    const { rerender } = render(<App />)
    expect(screen.queryByTestId("navigation-progress")).not.toBeInTheDocument()

    linkStatus.pending = true
    act(() => rerender(<App />))
    expect(screen.getByTestId("navigation-progress")).toBeInTheDocument()

    linkStatus.pending = false
    act(() => rerender(<App />))
    expect(screen.queryByTestId("navigation-progress")).not.toBeInTheDocument()
  })
})

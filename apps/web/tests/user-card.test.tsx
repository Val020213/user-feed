import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { UserCard } from "@/features/users/components/user-card"
import type { User } from "@/features/users/schemas"

const user: User = {
  id: 3,
  name: "Clementine Bauch",
  username: "Samantha",
  email: "Nathan@yesenia.net",
  phone: "1-463-123-4447",
  website: "ramiro.info",
  address: {
    street: "Douglas Extension",
    suite: "Suite 847",
    city: "McKenziehaven",
    zipcode: "59590-4157",
  },
  company: {
    name: "Romaguera-Jacobson",
    catchPhrase: "Face to face bifurcated interface",
  },
}

describe("UserCard", () => {
  it("shows who the user is and links to their posts", () => {
    render(<UserCard user={user} />)

    const link = screen.getByRole("link", { name: /Clementine Bauch/ })
    expect(link).toHaveAttribute("href", "/users/3")
    expect(screen.getByText("@Samantha")).toBeInTheDocument()
    expect(screen.getByText("Nathan@yesenia.net")).toBeInTheDocument()
    expect(screen.getByText("1-463-123-4447")).toBeInTheDocument()
    expect(screen.getByText("McKenziehaven")).toBeInTheDocument()
    expect(screen.getByText("Romaguera-Jacobson")).toBeInTheDocument()
  })
})

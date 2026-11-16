import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { UserAvatar } from "@/features/users/components/user-avatar"
import { hashToHue } from "@/features/users/utils/avatar-gradient"

describe("hashToHue", () => {
  it("gives the same hue for the same seed", () => {
    expect(hashToHue("Sincere@april.biz")).toBe(hashToHue("Sincere@april.biz"))
  })

  it("spreads different seeds over different hues", () => {
    const emails = [
      "Sincere@april.biz",
      "Shanna@melissa.tv",
      "Nathan@yesenia.net",
      "Julianne.OConner@kory.org",
      "Lucio_Hettinger@annie.ca",
    ]
    expect(new Set(emails.map((email) => hashToHue(email))).size).toBe(
      emails.length
    )
  })

  it("stays within 0-359 for any input", () => {
    for (const seed of ["", "a", "ñandú 🦤", "x".repeat(500)]) {
      const hue = hashToHue(seed)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
      expect(Number.isInteger(hue)).toBe(true)
    }
  })
})

describe("UserAvatar", () => {
  it("paints the initials on a gradient that belongs to the email", () => {
    render(
      <>
        <UserAvatar name="Leanne Graham" email="Sincere@april.biz" />
        <UserAvatar name="Leanne Copy" email="Sincere@april.biz" />
        <UserAvatar name="Ervin Howell" email="Shanna@melissa.tv" />
      </>
    )

    // jsdom rewrites hsl() as rgb(), so compare the avatars with each other.
    const [leanne, copy, ervin] = ["LG", "LC", "EH"].map(
      (text) => screen.getByText(text).style.backgroundImage
    )
    expect(leanne).toMatch(/^linear-gradient\(135deg/)
    expect(copy).toBe(leanne)
    expect(ervin).not.toBe(leanne)
  })
})

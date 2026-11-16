import { describe, expect, it } from "vitest"

import { escapeRegExp } from "@/lib/escape-regexp"

describe("escapeRegExp", () => {
  it("makes regex metacharacters match literally", () => {
    const input = "(a.b)*[c]?^$|+{1}\\"
    const pattern = new RegExp(escapeRegExp(input))

    expect(pattern.test(input)).toBe(true)
    expect(pattern.test("aXb")).toBe(false)
  })

  it("leaves plain text untouched", () => {
    expect(escapeRegExp("Leanne")).toBe("Leanne")
  })

  it("returns an empty string for empty input", () => {
    expect(escapeRegExp("")).toBe("")
  })
})

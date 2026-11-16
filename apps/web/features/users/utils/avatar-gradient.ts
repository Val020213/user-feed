export function hashToHue(seed: string) {
  let hash = 0
  for (const char of seed) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 360
  }
  return hash
}

/**
 * A two-stop gradient unique to the seed. The second hue sits 35° away, and
 * the lightness is lower than the reference (50%/45%) so white initials stay
 * readable on yellow and cyan hues.
 */
export function avatarGradient(seed: string) {
  const from = hashToHue(seed)
  const to = (from + 35) % 360
  return `linear-gradient(135deg, hsl(${from} 70% 42%), hsl(${to} 70% 34%))`
}

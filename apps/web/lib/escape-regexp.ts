/** Escapes text so it matches literally when the API treats it as a regex. */
export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

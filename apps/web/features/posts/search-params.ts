import { parseAsString } from "nuqs/server"

export const postsSearchParams = {
  q: parseAsString.withDefault(""),
}

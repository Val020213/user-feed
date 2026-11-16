import {
  createLoader,
  createParser,
  createSerializer,
  parseAsString,
  type inferParserType,
} from "nuqs/server"

/** Accepts only positive integers; anything else falls back to page 1. */
const positivePage = createParser({
  parse(value) {
    if (!/^[1-9]\d*$/.test(value)) return null
    const page = Number(value)
    return Number.isSafeInteger(page) ? page : null
  },
  serialize: String,
}).withDefault(1)

export const usersSearchParams = {
  q: parseAsString.withDefault(""),
  page: positivePage,
}

type UsersSearch = inferParserType<typeof usersSearchParams>

export const loadUsersSearchParams = createLoader(usersSearchParams)

const serializeUsersSearch = createSerializer(usersSearchParams)

export function usersHref(values: {
  [Key in keyof UsersSearch]?: UsersSearch[Key] | null
}) {
  return `/users${serializeUsersSearch(values)}`
}

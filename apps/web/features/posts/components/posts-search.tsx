"use client"

import { debounce, useQueryStates } from "nuqs"

import { SearchField } from "@workspace/ui/components/fields/search-field"

import { postsSearchParams } from "../search-params"

export function PostsSearch() {
  const [{ q }, setSearch] = useQueryStates(postsSearchParams)

  return (
    <search>
      <SearchField
        label="Search posts"
        placeholder="Search posts"
        value={q}
        onValueChange={(value) =>
          void setSearch(
            { q: value || null },
            // Typing waits for a pause; clearing applies at once.
            { limitUrlUpdates: value ? debounce(300) : undefined }
          )
        }
      />
    </search>
  )
}

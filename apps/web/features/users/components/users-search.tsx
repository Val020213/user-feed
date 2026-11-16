"use client"

import { debounce, useQueryStates } from "nuqs"

import { SearchField } from "@workspace/ui/components/fields/search-field"

import { usersSearchParams } from "../search-params"
import { useUsersTransition } from "./users-transition"

export function UsersSearch() {
  const { startTransition } = useUsersTransition()
  const [{ q }, setSearch] = useQueryStates(usersSearchParams, {
    shallow: false,
    startTransition,
  })

  return (
    <search>
      <SearchField
        label="Search users by name"
        placeholder="Search users by name"
        value={q}
        onValueChange={(value) =>
          void setSearch(
            { q: value || null, page: null },
            // Typing waits for a pause; clearing applies at once.
            { limitUrlUpdates: value ? debounce(300) : undefined }
          )
        }
      />
    </search>
  )
}

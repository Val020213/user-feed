import { SearchXIcon, UsersIcon } from "lucide-react"
import { redirect } from "next/navigation"
import type { SearchParams } from "nuqs/server"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"

import { loadUsersSearchParams, usersHref } from "../search-params"
import { getUsers } from "../server-actions"
import { UserCard } from "./user-card"
import { UsersPagination } from "./users-pagination"

export async function UserList({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q, page } = await loadUsersSearchParams(searchParams)
  const { users, total, totalPages } = await getUsers({ name: q, page })
  const search = q.trim()

  const lastPage = Math.max(totalPages, 1)

  if (page > lastPage)
    redirect(usersHref({ q, page: lastPage === 1 ? null : lastPage }))

  if (total === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {search ? <SearchXIcon /> : <UsersIcon />}
          </EmptyMedia>
          <EmptyTitle>{search ? "No users match" : "No users"}</EmptyTitle>
          <EmptyDescription>
            {search
              ? `Nobody's name contains "${search}". Try a shorter or different name.`
              : "There are no users to show yet."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {search
          ? `${total} ${total === 1 ? "user matches" : "users match"} "${search}"`
          : `${total} users`}
      </p>
      <ul className="grid gap-3">
        {users.map((user) => (
          <li key={user.id}>
            <UserCard user={user} />
          </li>
        ))}
      </ul>
      <UsersPagination page={page} totalPages={totalPages} />
    </>
  )
}

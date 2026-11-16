import type { Metadata } from "next"
import type { SearchParams } from "nuqs/server"
import { Suspense } from "react"

import { UserList } from "@/features/users/components/user-list"
import { UserListSkeleton } from "@/features/users/components/user-list-skeleton"
import { UsersSearch } from "@/features/users/components/users-search"
import {
  UsersResultsRegion,
  UsersTransitionProvider,
} from "@/features/users/components/users-transition"

export const metadata: Metadata = { title: "Users · User Feed" }

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Pick someone to read and write their posts.
        </p>
      </header>
      <UsersTransitionProvider>
        <Suspense>
          <UsersSearch />
        </Suspense>
        <UsersResultsRegion>
          <Suspense fallback={<UserListSkeleton />}>
            <UserList searchParams={searchParams} />
          </Suspense>
        </UsersResultsRegion>
      </UsersTransitionProvider>
    </main>
  )
}

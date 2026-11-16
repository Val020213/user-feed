"use client"

import {
  createContext,
  use,
  useTransition,
  type TransitionStartFunction,
} from "react"

type UsersTransition = {
  pending: boolean
  startTransition: TransitionStartFunction
}

const UsersTransitionContext = createContext<UsersTransition>({
  pending: false,
  startTransition: (callback) => void callback(),
})

/**
 * Shares one transition between the search box and the pagination so the list
 * dims while the server renders the next result.
 */
export function UsersTransitionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [pending, startTransition] = useTransition()

  return (
    <UsersTransitionContext value={{ pending, startTransition }}>
      {children}
    </UsersTransitionContext>
  )
}

export function useUsersTransition() {
  return use(UsersTransitionContext)
}

export function UsersResultsRegion({
  children,
}: {
  children: React.ReactNode
}) {
  const { pending } = useUsersTransition()

  return (
    <section
      aria-label="Users"
      aria-busy={pending}
      className="flex flex-col gap-4 transition-opacity aria-busy:opacity-60"
    >
      {children}
    </section>
  )
}

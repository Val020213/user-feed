"use client"

import { useQueryStates } from "nuqs"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination"

import { usersHref, usersSearchParams } from "../search-params"
import { useUsersTransition } from "./users-transition"

export function UsersPagination({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  const { startTransition } = useUsersTransition()
  const [{ q }, setSearch] = useQueryStates(usersSearchParams, {
    shallow: false,
    startTransition,
    history: "push",
  })

  if (totalPages <= 1) return null

  // Links keep a real href so they work before hydration and open in new tabs;
  // a plain click goes through nuqs so the list dims while the server renders.
  function link(target: number) {
    return {
      href: usersHref({ q, page: target }),
      onClick(event: React.MouseEvent<HTMLAnchorElement>) {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return
        event.preventDefault()
        void setSearch({ page: target === 1 ? null : target })
      },
    }
  }

  // Previous and Next always render so the row keeps its width; at either end
  // the link loses its href, which removes it from the tab order and clicks.
  function edgeLink(target: number, enabled: boolean) {
    if (enabled) return link(target)
    return {
      "aria-disabled": true,
      className: "pointer-events-none opacity-50",
    }
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <Pagination>
      <PaginationContent className="flex-wrap">
        <PaginationItem>
          <PaginationPrevious {...edgeLink(page - 1, page > 1)} />
        </PaginationItem>
        {pages.map((target) => (
          <PaginationItem key={target}>
            <PaginationLink
              isActive={target === page}
              aria-label={`Page ${target}`}
              {...link(target)}
            >
              {target}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext {...edgeLink(page + 1, page < totalPages)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

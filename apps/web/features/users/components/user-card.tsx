import {
  Building2Icon,
  ChevronRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@workspace/ui/components/card"

import type { User } from "../schemas"
import { initials } from "../utils/initials"

/**
 * One full-width row per user: who they are on the left, how to reach them in
 * a two-column block on wider screens, and a chevron that marks the row as a link.
 */
export function UserCard({ user }: { user: User }) {
  const details = [
    { label: "Email", icon: MailIcon, value: user.email },
    { label: "Phone", icon: PhoneIcon, value: user.phone },
    { label: "City", icon: MapPinIcon, value: user.address.city },
    { label: "Company", icon: Building2Icon, value: user.company.name },
  ]

  return (
    <Link
      href={`/users/${user.id}`}
      className="group block rounded-4xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Card className="transition-colors group-hover:bg-muted/50">
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:items-center md:gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted font-medium"
            >
              {initials(user.name)}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="truncate font-heading font-medium">{user.name}</h2>
              <p className="truncate text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>

          <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {details.map(({ label, icon: Icon, value }) => (
              <div key={label} className="flex min-w-0 items-center gap-2">
                <dt>
                  <Icon
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd className="truncate">{value}</dd>
              </div>
            ))}
          </dl>

          <ChevronRightIcon
            className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 md:block"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </Link>
  )
}

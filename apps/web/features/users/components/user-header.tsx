import {
  ArrowLeftIcon,
  Building2Icon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Skeleton } from "@workspace/ui/components/skeleton"

import { NavigationPendingReporter } from "@/lib/navigation-progress"

import { getUser } from "../server-actions"
import { initials } from "../utils/initials"
import { resolveUserId } from "../utils/user-id"

function telHref(phone: string) {
  // "1-770-736-8031 x56442": dial the number, drop the extension.
  return `tel:${phone.replace(/\s*x.*$/, "").replace(/[^\d+]/g, "")}`
}

export async function UserHeader({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser(await resolveUserId(params))
  if (!user) notFound()

  const { address, company } = user
  const details = [
    {
      label: "Email",
      icon: MailIcon,
      value: <a href={`mailto:${user.email}`}>{user.email}</a>,
    },
    {
      label: "Phone",
      icon: PhoneIcon,
      value: <a href={telHref(user.phone)}>{user.phone}</a>,
    },
    {
      label: "Website",
      icon: GlobeIcon,
      value: (
        <a
          href={`https://${user.website}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {user.website}
        </a>
      ),
    },
    {
      label: "Address",
      icon: MapPinIcon,
      value: `${address.street}, ${address.suite}, ${address.city} ${address.zipcode}`,
    },
    { label: "Company", icon: Building2Icon, value: company.name },
  ]

  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-medium"
        >
          {initials(user.name)}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="truncate font-heading text-2xl font-semibold">
            {user.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            @{user.username} · &ldquo;{company.catchPhrase}&rdquo;
          </p>
        </div>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {details.map(({ label, icon: Icon, value }) => (
          <div key={label} className="flex min-w-0 items-start gap-2">
            <dt className="pt-0.5">
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">{label}</span>
            </dt>
            <dd className="min-w-0 wrap-break-word [&_a]:underline-offset-4 [&_a]:hover:underline">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  )
}

export function UserHeaderSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading user"
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>
    </div>
  )
}

export function BackToUsers() {
  return (
    <Link
      href="/users"
      className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" aria-hidden="true" /> All users
      <NavigationPendingReporter />
    </Link>
  )
}

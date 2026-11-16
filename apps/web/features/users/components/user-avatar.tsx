import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

import { avatarGradient } from "../utils/avatar-gradient"
import { initials } from "../utils/initials"

/** Initials on a gradient seeded by the email, so each user keeps their colours. */
export function UserAvatar({
  name,
  email,
  className,
}: {
  name: string
  email: string
  className?: string
}) {
  return (
    <Avatar className={className}>
      <AvatarFallback
        className="bg-transparent font-medium text-white"
        style={{ backgroundImage: avatarGradient(email) }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

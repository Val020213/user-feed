import { z } from "zod"

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
  }),
  company: z.object({ name: z.string(), catchPhrase: z.string() }),
})

export type User = z.infer<typeof userSchema>

export const USERS_PAGE_SIZE = 5

export type UsersPage = {
  users: User[]
  total: number
  totalPages: number
}

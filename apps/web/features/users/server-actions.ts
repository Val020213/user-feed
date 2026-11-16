"use server"

import { cacheLife } from "next/cache"
import { z } from "zod"

import { escapeRegExp } from "@/lib/escape-regexp"
import { ApiError, apiGet } from "@/lib/jsonplaceholder"

import {
  USERS_PAGE_SIZE,
  userSchema,
  type User,
  type UsersPage,
} from "./schemas"

/** Lists users whose name contains `name`, case-insensitively. */
export async function getUsers({
  name,
  page,
}: {
  name: string
  page: number
}): Promise<UsersPage> {
  "use cache"
  cacheLife("hours")

  const term = name.trim()
  const { data, total } = await apiGet("/users", z.array(userSchema), {
    // name_like is a regex on the API side, so the term must match literally.
    name_like: term ? escapeRegExp(term) : undefined,
    _page: page,
    _limit: USERS_PAGE_SIZE,
  })

  const count = total ?? data.length
  return {
    users: data,
    total: count,
    totalPages: Math.ceil(count / USERS_PAGE_SIZE),
  }
}

/** Returns the user, or null when it does not exist. */
export async function getUser(id: number): Promise<User | null> {
  "use cache"
  cacheLife("hours")

  try {
    const { data } = await apiGet(`/users/${id}`, userSchema)
    return data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

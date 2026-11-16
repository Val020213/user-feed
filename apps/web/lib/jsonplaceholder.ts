import type { z } from "zod"

const API_BASE_URL = "https://jsonplaceholder.typicode.com"

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type QueryValue = string | number | undefined

function buildApiUrl(path: string, query: Record<string, QueryValue> = {}) {
  const url = new URL(path, API_BASE_URL)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value))
  }
  return url
}

const TIMEOUT_MS = 10_000

/** Sends a request and turns network failures, timeouts and non-2xx into ApiError. */
async function request(url: URL, init?: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    throw new ApiError(
      error instanceof DOMException && error.name === "TimeoutError"
        ? "The server took too long to answer. Try again."
        : "Could not reach the server. Check your connection."
    )
  }

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}.`,
      response.status
    )
  }
  return response
}

/**
 * Fetches a JSONPlaceholder resource and validates it. `total` comes from the
 * X-Total-Count header, which the API only sends for paginated requests.
 */
export async function apiGet<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  query: Record<string, QueryValue> = {}
): Promise<{ data: z.infer<Schema>; total: number | null }> {
  const response = await request(buildApiUrl(path, query))

  const parsed = schema.safeParse(await response.json())
  if (!parsed.success) {
    throw new ApiError("The server returned unexpected data.")
  }

  const totalHeader = response.headers.get("X-Total-Count")
  return {
    data: parsed.data,
    total: totalHeader === null ? null : Number(totalHeader),
  }
}

/** Sends a JSON body to JSONPlaceholder. It echoes the body but stores nothing. */
export async function apiPost(path: string, body: unknown): Promise<void> {
  await request(buildApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
  })
}

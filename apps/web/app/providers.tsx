"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { NavigationProgress } from "@/components/navigation-progress"
import { getQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <NuqsAdapter>
      <NavigationProgress />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsAdapter>
  )
}

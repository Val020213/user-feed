"use client"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import { NavigationProgress } from "@/components/navigation-progress"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <NavigationProgress />
      {children}
    </NuqsAdapter>
  )
}

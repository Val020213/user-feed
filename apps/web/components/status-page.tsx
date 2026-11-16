/** The frame of a not-found or error page: its message centered on the screen. */
export function StatusPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-4 py-10">
      {children}
    </main>
  )
}

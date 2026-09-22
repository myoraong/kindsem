"use client"

import { RecentResultProvider } from "@/components/recent-result-context"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RecentResultProvider>
      {children}
      <Toaster position="bottom-center" mobileOffset={{ bottom: "8.25rem" }} />
    </RecentResultProvider>
  )
}

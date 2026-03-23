"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "citizen") {
      router.push("/admin")
    }
  }, [user, router])

  if (!user || user.role !== "citizen") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar role="citizen" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

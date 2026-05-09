"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && user.role !== "admin") {
      router.push("/citizen")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Проверка на сесија...</p>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

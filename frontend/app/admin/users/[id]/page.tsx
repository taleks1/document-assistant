"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { mockRequests, requestTypeLabels } from "@/lib/mock-data"
import { apiGetAdminUserById, type User } from "@/lib/api"
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Hash,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react"


const userRoleLabels: Record<string, string> = {
  CITIZEN: "Корисник",
  ADMIN: "Администратор"
}

const userStatusStyles: Record<string, string> = {
  true: "bg-success/10 text-success border-success/30",
  false: "bg-destructive/10 text-destructive border-destructive/30",
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()

  const userRequests = useMemo(() => {
    return mockRequests.filter((request) => request.userId === id)
  }, [id])

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)

    apiGetAdminUserById(id)
      .then(setUser)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Грешка при вчитување на корисникот")
      )
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6 lg:p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Се вчитува корисникот...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/admin/users">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error ?? "Корисникот не е пронајден."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div>
        <Link href="/admin/users">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад кон корисници
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Профил на корисник</h1>
        <p className="text-muted-foreground">Преглед на информациите за корисникот</p>
      </div>

      <Separator />

      {/* User info card */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Основни информации</CardTitle>
          <CardDescription>Податоци за избраниот корисник</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>

            {/* Details grid */}
            <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <div className="flex items-start gap-2">
                <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Име и презиме</p>
                  <p className="font-medium text-foreground">
                    {user.firstname} {user.lastname}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Улога</p>
                  <Badge variant="outline" className="mt-0.5">
                    {userRoleLabels[user.role] ?? user.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Статус</p>
                  <Badge className={`mt-0.5 ${userStatusStyles[String(user.active)]}`}>
                    {user.active ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Креиран</p>
                  <p className="font-medium text-foreground">
                    {user.dateCreated ?? "—"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* User requests (mocked) */}
      <Card className="border-none shadow-none bg-transparent mt-6">
        <CardHeader>
          <CardTitle>Барања на корисникот</CardTitle>
          <CardDescription>
            Вкупно {userRequests.length} барањ{userRequests.length === 1 ? "е" : "а"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRequests.length === 0 ? (
            <p className="text-muted-foreground">Овој корисник моментално нема барања.</p>
          ) : (
            <div className="space-y-4">
              {userRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{request.title}</p>
                      <p className="text-sm text-muted-foreground">{request.id}</p>
                    </div>

                    <StatusBadge status={request.status} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Тип</p>
                        <p className="text-sm font-medium text-foreground">
                          {requestTypeLabels[request.type]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Поднесено</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(request.createdAt).toLocaleDateString("mk-MK")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Е-пошта</p>
                        <p className="text-sm font-medium text-foreground">
                          {request.userEmail}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Прилози</p>
                      <p className="text-sm font-medium text-foreground">
                        {request.attachments.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Опис</p>
                    <p className="text-sm text-foreground">{request.description}</p>
                  </div>

                  <div className="mt-4">
                    <Link href={`/admin/requests/${request.id}`}>
                      <Button variant="outline" size="sm">
                        Отвори барање
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
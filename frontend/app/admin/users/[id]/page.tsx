"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import {
  mockUsers,
  mockRequests,
  getUserRoleLabel,
  getUserStatusLabel,
  requestTypeLabels,
} from "@/lib/mock-data"
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
const userStatusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-destructive/10 text-destructive border-destructive/30",
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const user = mockUsers.find((u) => u.id === id)

  const userRequests = useMemo(() => {
    return mockRequests.filter((request) => request.userId === id)
  }, [id])

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/admin/users">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
        </Link>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Корисникот не е пронајден.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <Link href="/admin/users">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад кон корисници
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-foreground">Профил на корисник</h1>
        <p className="text-muted-foreground">Преглед на профилот и неговите барања</p>
      </div>
<Separator />
<Card className="border-none shadow-none bg-transparent">        <CardHeader>
          <CardTitle>Основни информации</CardTitle>
          <CardDescription>Податоци за избраниот корисник</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>

            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Име и презиме</p>
                <p className="font-medium text-foreground">{user.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Е-пошта</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Улога</p>
                <Badge variant="outline">{getUserRoleLabel(user.role)}</Badge>
              </div>

             <div>
  <p className="text-sm text-muted-foreground">Статус</p>
  <Badge className={userStatusStyles[user.status]}>
    {getUserStatusLabel(user.status)}
  </Badge>
</div>

              <div>
                <p className="text-sm text-muted-foreground">Креиран</p>
                <p className="font-medium text-foreground">
                  {new Date(user.createdAt).toLocaleDateString("mk-MK")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Вкупно барања</p>
                <p className="font-medium text-foreground">{userRequests.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
<Separator />
<Card className="border-none shadow-none bg-transparent">        <CardHeader>
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
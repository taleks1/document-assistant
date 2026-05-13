"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { apiGetAdminUsers, type User, type Page } from "@/lib/api"
import {
  Search,
  Filter,
  User as UserIcon,
  Eye,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// ─── Label / style helpers ────────────────────────────────────────────────────

const userStatusLabels: Record<string, string> = {
  true: "Активен",
  false: "Неактивен",
}

const userRoleLabels: Record<string, string> = {
  CITIZEN: "Корисник",
  ADMIN: "Администратор",
  citizen: "Корисник",
  admin: "Администратор",
}

const userStatusStyles: Record<string, string> = {
  true: "border-success/30 bg-success/10 text-success",
  false: "border-destructive/30 bg-destructive/10 text-destructive",
}

const PAGE_SIZE = 10

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [page, setPage] = useState<Page<User> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Client-side filters applied on the current page's content
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">("all")
  const [roleFilter, setRoleFilter] = useState<"all" | "CITIZEN" | "ADMIN">("all")

  const fetchUsers = useCallback(async (pageIndex: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetAdminUsers(pageIndex, PAGE_SIZE)
      setPage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при вчитување на корисниците")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage, fetchUsers])

  // Apply client-side search/filter on the loaded page content
  const filteredUsers = (page?.content ?? []).filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || String(user.active) === statusFilter
    const matchesRole =
      roleFilter === "all" || user.role.toUpperCase() === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const totalPages = page?.totalPages ?? 0
  const totalElements = page?.totalElements ?? 0
  const isFirst = page?.first ?? true
  const isLast = page?.last ?? true

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Управување со корисници</h1>
          <p className="text-muted-foreground">Управување со кориснички сметки и пристап</p>
        </div>
      </div>
      <Separator />

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Сите корисници</CardTitle>
          <CardDescription>
            {isLoading
              ? "Се вчитуваат корисници..."
              : `${filteredUsers.length} прикажани · вкупно ${totalElements} корисници`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Пребарај по име или е-пошта..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | "true" | "false")}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите</SelectItem>
                  <SelectItem value="true">Активни</SelectItem>
                  <SelectItem value="false">Неактивни</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as "all" | "CITIZEN" | "ADMIN")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Улога" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите</SelectItem>
                  <SelectItem value="CITIZEN">Корисник</SelectItem>
                  <SelectItem value="ADMIN">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table */}
          <div className="rounded-[22px] bg-[oklch(0.97_0.006_160)] p-3 shadow-sm overflow-x-auto">
            <Table className="border-separate border-spacing-y-2 text-sm min-w-[800px]">
              <TableHeader>
                <TableRow className="border-0 bg-transparent hover:bg-transparent">
                  <TableHead className="rounded-l-[16px] bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Корисник
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Улога
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Статус
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Креиран
                  </TableHead>
                  <TableHead className="rounded-r-[16px] bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Акции
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="h-24 rounded-[14px] bg-white text-center text-muted-foreground shadow-sm"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Се вчитуваат корисници...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="h-24 rounded-[14px] bg-white text-center text-muted-foreground shadow-sm"
                    >
                      Нема корисници
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-0 bg-transparent text-center">
                      {/* Корисник */}
                      <TableCell className="rounded-l-[14px] border border-r-0 bg-white px-3 py-3 shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3]">
                            <UserIcon className="h-4 w-4 text-slate-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-700">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-[10px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Улога */}
                      <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
                        <Badge variant="outline" className="text-xs">
                          {userRoleLabels[user.role] ?? user.role}
                        </Badge>
                      </TableCell>

                      {/* Статус */}
                      <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
                        <Badge
                          className={`${userStatusStyles[String(user.active)]} text-xs`}
                        >
                          {userStatusLabels[String(user.active)]}
                        </Badge>
                      </TableCell>

                      {/* Креиран */}
                      <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
                        {user.dateCreated ? formatDate(user.dateCreated) : "—"}
                      </TableCell>

                      {/* Акции */}
                      <TableCell className="rounded-r-[14px] border border-l-0 bg-white px-3 py-3 shadow-sm">
                        <div className="flex justify-center">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-orange-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Страница {currentPage + 1} од {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isFirst || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Претходно
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLast || isLoading}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Следно
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
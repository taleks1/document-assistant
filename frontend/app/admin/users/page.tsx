"use client"

import { useState } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatsCard } from "@/components/stats-card"
import { mockUsers } from "@/lib/mock-data"
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  Mail,
  Eye,
  UserX,
  UserCheck,
  Users,
  UserPlus,
  Clock,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
const userStatusLabels: Record<string, string> = {
  active: "Активен",
  inactive: "Неактивен",
}

const userRoleLabels: Record<string, string> = {
  citizen: "Корисник",
  admin: "Администратор",
}

const userStatusStyles: Record<string, string> = {
  active: "border-success/30 bg-success/10 text-success",
  inactive: "border-destructive/30 bg-destructive/10 text-destructive",
}

function getUserStatusLabel(status: string) {
  return userStatusLabels[status] || status
}

function getUserRoleLabel(role: string) {
  return userRoleLabels[role] || role
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = useState<"all" | "citizen" | "admin">("all")

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  return (
    <div className="p-6 lg:p-8">
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
            {filteredUsers.length} пронајден{filteredUsers.length !== 1 ? "и" : ""} {filteredUsers.length !== 1 ? "корисници" : "корисник"}
          </CardDescription>
        </CardHeader>

        <CardContent>
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
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите</SelectItem>
                  <SelectItem value="active">Активни</SelectItem>
                  <SelectItem value="inactive">Неактивни</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Улога" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите</SelectItem>
                  <SelectItem value="citizen">Корисник</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

<div className="rounded-[22px] bg-[oklch(0.97 0.006 160)] p-3 shadow-sm overflow-x-auto">
  <Table className="border-separate border-spacing-y-2 text-sm min-w-[900px]">
    
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
      Барања
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
      {filteredUsers.length === 0 ? (
        <TableRow className="border-0 hover:bg-transparent">
          <TableCell
            colSpan={6}
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
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-700">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
            </TableCell>

            {/* Улога */}
            <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
              <Badge variant="outline" className="text-xs">
                {getUserRoleLabel(user.role)}
              </Badge>
            </TableCell>

            {/* Статус */}
            <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
              <Badge className={`${userStatusStyles[user.status]} text-xs`}>
                {getUserStatusLabel(user.status)}
              </Badge>
            </TableCell>

            {/* Барања */}
            <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
              {user.requestCount}
            </TableCell>

            {/* Креиран */}
            <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
              {new Date(user.createdAt).toLocaleDateString()}
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

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Прикажани {filteredUsers.length} од вкупно {mockUsers.length} корисници
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Претходно
              </Button>
              <Button variant="outline" size="sm" disabled>
                Следно
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
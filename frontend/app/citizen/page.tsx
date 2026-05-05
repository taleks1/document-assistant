"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatsCard } from "@/components/stats-card"
import { StatusBadge } from "@/components/status-badge"
import { mockRequests, getCitizenStats } from "@/lib/mock-data"
import { FileText, Clock, CheckCircle, XCircle, Plus, Eye, Search } from "lucide-react"

const requestTypeLabels: Record<string, string> = {
  request: "Барање",
  permit: "Дозвола",
  complaint: "Жалба",
  application: "Апликација",
  certificate: "Потврда",
  objection: "Приговор",
  statement: "Изјава",
  report: "Пријава",
  other: "Друго",
}

export default function CitizenDashboard() {
  const { user } = useAuth()
  const stats = getCitizenStats("1")
  const recentRequests = mockRequests.filter((r) => r.userId === "1").slice(0, 5)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Добредојде назад, {user?.name?.split(" ")[0] || "Корисник"}
          </h1>
          <p className="text-muted-foreground">
            Преглед на твоите административни барања
          </p>
        </div>
        <Link href="/citizen/new-request">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ново барање
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Вкупно барања"
          value={stats.total}
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Во обработка"
          value={stats.processing}
          icon={<Clock className="h-6 w-6 text-warning" />}
        />
        <StatsCard
          title="Одобрени"
          value={stats.approved}
          icon={<CheckCircle className="h-6 w-6 text-success" />}
        />
        <StatsCard
          title="Одбиени"
          value={stats.rejected}
          icon={<XCircle className="h-6 w-6 text-destructive" />}
        />
      </div>
      <Separator />

      {/* Recent Requests */}
<Card className="border-none bg-transparent shadow-none">
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Последни барања</CardTitle>
      <CardDescription>
        Твоите најнови поднесени административни барања
      </CardDescription>
    </div>

    <Link href="/citizen/requests">
      <Button variant="outline" size="sm">
        Види ги сите
      </Button>
    </Link>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto rounded-[22px] bg-card p-3 shadow-sm">
      <Table className="min-w-[1000px] border-separate border-spacing-y-2 text-sm">
        <TableHeader>
          <TableRow className="overflow-hidden border-0 bg-transparent hover:bg-transparent">
            <TableHead className="rounded-l-[16px] bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
              ID на барање
            </TableHead>

            <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
              Тип
            </TableHead>

            <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
              Наслов
            </TableHead>

            <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
              Датум
            </TableHead>

            <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
              Статус
            </TableHead>

            <TableHead className="rounded-r-[16px] bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
              Акции
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {recentRequests.map((request) => (
            <TableRow
              key={request.id}
              className="overflow-hidden border-0 bg-transparent hover:bg-transparent"
            >
              <TableCell className="rounded-l-[14px] border border-r-0 border-border bg-white px-3 py-3 text-center font-medium text-slate-700 shadow-sm">
                {request.id}
              </TableCell>

              <TableCell className="border-y border-border bg-white px-3 py-3 text-center text-slate-700 shadow-sm">
                {requestTypeLabels[request.type] || request.type}
              </TableCell>

              <TableCell className="max-w-[160px] truncate border-y border-border bg-white px-3 py-3 text-center text-slate-700 shadow-sm">
                {request.title}
              </TableCell>

              <TableCell className="border-y border-border bg-white px-3 py-3 text-center text-slate-700 shadow-sm">
                {new Date(request.createdAt).toLocaleDateString("mk-MK")}
              </TableCell>

              <TableCell className="border-y border-border bg-white px-3 py-3 text-center shadow-sm">
                <div className="flex justify-center">
                  <StatusBadge status={request.status} />
                </div>
              </TableCell>

              <TableCell className="rounded-r-[14px] border border-l-0 border-border bg-white px-3 py-3 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/citizen/requests/${request.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href={`/citizen/tracking?id=${request.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Search className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Link href="/citizen/new-request" className="block">
          <StatsCard
            title="Поднеси ново барање"
            value=""
            description="Започни ново административно барање"
            icon={<Plus className="h-6 w-6 text-primary" />}
            className="h-full cursor-pointer transition-colors hover:border-primary/50"
          />
        </Link>

        <Link href="/citizen/tracking" className="block">
          <StatsCard
            title="Следи статус"
            value=""
            description="Провери го статусот на твоите барања"
            icon={<Search className="h-6 w-6 text-info" />}
            className="h-full cursor-pointer transition-colors hover:border-primary/50"
          />
        </Link>

      </div>
    </div>
  )
}
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
<Card className="border-none shadow-none bg-transparent">        <CardHeader className="flex flex-row items-center justify-between">
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
          <div className="rounded-[28px] bg-[#f3f1ee] p-4 shadow-sm">
            <Table className="border-separate border-spacing-y-3">
              <TableHeader>
                <TableRow className="overflow-hidden border-0 bg-transparent hover:bg-transparent">
                  <TableHead className="rounded-l-[22px] bg-emerald-500 px-5 py-4 text-center font-semibold text-white">
                    ID на барање
                  </TableHead>
                  <TableHead className="bg-emerald-500 px-5 py-4 text-center font-semibold text-white">
                    Тип
                  </TableHead>
                  <TableHead className="bg-emerald-500 px-5 py-4 text-center font-semibold text-white">
                    Наслов
                  </TableHead>
                  <TableHead className="bg-emerald-500 px-5 py-4 text-center font-semibold text-white">
                    Датум
                  </TableHead>
                  <TableHead className="bg-emerald-500 px-5 py-4 text-center font-semibold text-white">
                    Статус
                  </TableHead>
                  <TableHead className="rounded-r-[22px] bg-emerald-500 px-5 py-4 text-center font-semibold text-white">
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
                    <TableCell className="rounded-l-[20px] border border-r-0 border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle font-medium text-slate-700 shadow-sm">
                      {request.id}
                    </TableCell>

                    <TableCell className="border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle text-slate-700 shadow-sm">
                      {requestTypeLabels[request.type] || request.type}
                    </TableCell>

                    <TableCell className="max-w-[200px] truncate border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle text-slate-700 shadow-sm">
                      {request.title}
                    </TableCell>

                    <TableCell className="border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle text-slate-700 shadow-sm">
                      {new Date(request.createdAt).toLocaleDateString("mk-MK")}
                    </TableCell>

                    <TableCell className="border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle shadow-sm">
                      <div className="flex justify-center">
                        <StatusBadge status={request.status} />
                      </div>
                    </TableCell>

                    <TableCell className="rounded-r-[20px] border border-l-0 border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/citizen/requests/${request.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link href={`/citizen/tracking?id=${request.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
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
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <Link href="/citizen/help" className="block">
          <StatsCard
            title="Побарај помош"
            value=""
            description="Разговарај со нашиот AI асистент"
            icon={<FileText className="h-6 w-6 text-success" />}
            className="h-full cursor-pointer transition-colors hover:border-primary/50"
          />
        </Link>
      </div>
    </div>
  )
}
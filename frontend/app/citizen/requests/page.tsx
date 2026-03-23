"use client"

import { useState } from "react"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { StatusBadge } from "@/components/status-badge"
import { mockRequests, type RequestStatus, type RequestType } from "@/lib/mock-data"
import { Search, Eye, Download, Plus, Filter } from "lucide-react"

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

export default function MyRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all")

  const userRequests = mockRequests.filter((r) => r.userId === "1")

  const filteredRequests = userRequests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мои барања</h1>
          <p className="text-muted-foreground">
            Преглед и управување со сите ваши поднесени барања
          </p>
        </div>

        <Link href="/citizen/new-request">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ново барање
          </Button>
        </Link>
      </div>
      <Separator />

<Card className="border-none shadow-none bg-transparent">        <CardHeader>
          <CardTitle>Сите барања</CardTitle>
          <CardDescription>
            {filteredRequests.length} барањ{filteredRequests.length !== 1 ? "а" : "е"} пронајдени
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Пребарувај по ID или наслов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onValueChange={(v: string) => setStatusFilter(v as RequestStatus | "all")}
              >
                <SelectTrigger className="w-[170px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите статуси</SelectItem>
                  <SelectItem value="sent">Поднесено</SelectItem>
                  <SelectItem value="processing">Во обработка</SelectItem>
                  <SelectItem value="reviewed">Разгледано</SelectItem>
                  <SelectItem value="approved">Одобрено</SelectItem>
                  <SelectItem value="rejected">Одбиено</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(v: string) => setTypeFilter(v as RequestType | "all")}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите типови</SelectItem>
                  <SelectItem value="request">Барање</SelectItem>
                  <SelectItem value="permit">Дозвола</SelectItem>
                  <SelectItem value="complaint">Жалба</SelectItem>
                  <SelectItem value="application">Апликација</SelectItem>
                  <SelectItem value="certificate">Потврда</SelectItem>
                  <SelectItem value="objection">Приговор</SelectItem>
                  <SelectItem value="statement">Изјава</SelectItem>
                  <SelectItem value="report">Пријава</SelectItem>
                  <SelectItem value="other">Друго</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
<div className="rounded-[28px] bg-[#f3f1ee] p-4 shadow-sm">
  <Table className="border-separate border-spacing-y-3">
    <TableHeader>
      <TableRow className="overflow-hidden border-0 bg-transparent hover:bg-transparent">
        <TableHead className="rounded-l-[22px] bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          ID на барање
        </TableHead>
        <TableHead className="bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          Тип
        </TableHead>
        <TableHead className="bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          Наслов
        </TableHead>
        <TableHead className="bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          Поднесено
        </TableHead>
        <TableHead className="bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          Последно ажурирање
        </TableHead>
        <TableHead className="bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          Статус
        </TableHead>
        <TableHead className="rounded-r-[22px] bg-emerald-500 px-5 py-4 text-center text-white font-semibold">
          Акции
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {filteredRequests.length === 0 ? (
        <TableRow className="border-0 hover:bg-transparent">
          <TableCell
            colSpan={7}
            className="h-32 rounded-[20px] bg-white text-center text-muted-foreground shadow-sm align-middle"
          >
            Нема пронајдени барања според избраните критериуми
          </TableCell>
        </TableRow>
      ) : (
        filteredRequests.map((request) => (
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

            <TableCell className="max-w-[220px] truncate border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle text-slate-700 shadow-sm">
              {request.title}
            </TableCell>

            <TableCell className="border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle text-slate-700 shadow-sm">
              {new Date(request.createdAt).toLocaleDateString()}
            </TableCell>

            <TableCell className="border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle text-slate-700 shadow-sm">
              {new Date(request.updatedAt).toLocaleDateString()}
            </TableCell>

            <TableCell className="border-y border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle shadow-sm">
              <div className="flex justify-center">
                <StatusBadge status={request.status} />
              </div>
            </TableCell>

            <TableCell className="rounded-r-[20px] border border-l-0 border-[#d9d9d9] bg-white px-5 py-5 text-center align-middle shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Link href={`/citizen/requests/${request.id}`}>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title="Прегледај">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href={`/citizen/tracking?id=${request.id}`}>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title="Следи">
                    <Search className="h-4 w-4" />
                  </Button>
                </Link>

                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title="Преземи">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>
        </CardContent>
      </Card>
    </div>
  )
}
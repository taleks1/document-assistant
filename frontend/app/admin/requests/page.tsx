"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/status-badge"
import {
  apiAdminGetAllRequests,
  apiAdminUpdateRequestStatus,
  type DocumentRequestFullResponse,
  type DocumentRequestStatus,
  type DocumentRequestType,
} from "@/lib/api"
import {
  Search,
  Filter,
  Eye,
  Users,
  SortAsc,
} from "lucide-react"

const DocumentRequestTypeLabel: Record<DocumentRequestType, string> = {
  REQUEST: "Барање",
  PERMIT: "Дозвола",
  COMPLAINT: "Жалба",
  APPLICATION: "Апликација",
  CERTIFICATE: "Потврда",
  OBJECTION: "Приговор",
  STATEMENT: "Изјава",
  REPORT: "Извештај",
  OTHER: "Друго",
}

const DocumentRequestStatusLabel: Record<DocumentRequestStatus, string> = {
  SUBMITTED: "Поднесено",
  IN_REVIEW: "Во обработка",
  REVIEWED: "Разгледано",
  APPROVED: "Одобрено",
  REJECTED: "Одбиено",
}

const PAGE_SIZE = 10

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<DocumentRequestFullResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DocumentRequestStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<DocumentRequestType | "all">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiAdminGetAllRequests(currentPage, PAGE_SIZE)
        setRequests(data.content)
        setTotalElements(data.totalElements)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Грешка при вчитување на барањата")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [currentPage])

  const handleStatusChange = async (id: number, newStatus: DocumentRequestStatus) => {
    try {
      const updated = await apiAdminUpdateRequestStatus(id, newStatus)
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesType = typeFilter === "all" || request.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Управување со барања</h1>
        <p className="text-muted-foreground">Преглед и обработка на барања од граѓани</p>
      </div>
      <Separator />

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Сите барања</CardTitle>
          <CardDescription>
            {filteredRequests.length} {filteredRequests.length !== 1 ? "пронајдени барања" : "пронајдено барање"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Пребарај по ID, корисник или наслов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as DocumentRequestStatus | "all")}
              >
                <SelectTrigger className="w-[170px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите статуси</SelectItem>
                  {(Object.keys(DocumentRequestStatusLabel) as DocumentRequestStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{DocumentRequestStatusLabel[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as DocumentRequestType | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите типови</SelectItem>
                  {(Object.keys(DocumentRequestTypeLabel) as DocumentRequestType[]).map((t) => (
                    <SelectItem key={t} value={t}>{DocumentRequestTypeLabel[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}
              >
                <SelectTrigger className="w-[150px]">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Најнови прво</SelectItem>
                  <SelectItem value="oldest">Најстари прво</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-[22px] bg-[oklch(0.97 0.006 160)] p-3 shadow-sm overflow-x-auto">
            <Table className="border-separate border-spacing-y-2 text-sm min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-0 bg-transparent hover:bg-transparent">
                  <TableHead className="rounded-l-[16px] bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    ID на барање
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Корисник
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Тип
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Наслов
                  </TableHead>
                  <TableHead className="bg-primary px-3 py-3 text-center font-semibold text-primary-foreground">
                    Поднесено
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
                {loading ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={7} className="h-24 rounded-[14px] bg-white text-center text-muted-foreground shadow-sm">
                      Се вчитуваат барањата...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={7} className="h-24 rounded-[14px] bg-white text-center text-destructive shadow-sm">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={7} className="h-24 rounded-[14px] bg-white text-center text-muted-foreground shadow-sm">
                      Нема барања што одговараат на критериумите
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="border-0 bg-transparent text-center">
                      <TableCell className="rounded-l-[14px] border border-r-0 bg-white px-3 py-3 font-medium text-slate-700 shadow-sm">
                        {request.referenceNumber}
                      </TableCell>

                      <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3]">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-slate-700">{request.userFullName}</p>
                            <p className="text-[10px] text-slate-500">{request.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
                        {DocumentRequestTypeLabel[request.type] ?? request.type}
                      </TableCell>

                      <TableCell className="max-w-[160px] truncate border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
                        {request.title}
                      </TableCell>

            <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
              {formatDate(request.createdAt)}
            </TableCell>

                      <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="hover:opacity-80">
                                <StatusBadge status={request.status} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                              {(Object.keys(DocumentRequestStatusLabel) as DocumentRequestStatus[]).map((s) => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusChange(request.id, s)}>
                                  {DocumentRequestStatusLabel[s]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                      <TableCell className="rounded-r-[14px] border border-l-0 bg-white px-3 py-3 shadow-sm">
                        <div className="flex justify-center">
                          <Link href={`/admin/requests/${request.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-orange-100">
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
              Прикажани {filteredRequests.length} од вкупно {totalElements} барања
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Претходно
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Следно
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
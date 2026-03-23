"use client"

import { useEffect, useState } from "react"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/status-badge"
import {
  mockRequests,
  type RequestStatus,
  type RequestType,
  requestTypeLabels,
  statusLabels,
} from "@/lib/mock-data"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Users,
  SortAsc,
} from "lucide-react"

const STORAGE_KEY = "admin-requests"
type RequestItem = (typeof mockRequests)[number]

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  useEffect(() => {
    const savedRequests = localStorage.getItem(STORAGE_KEY)

    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests) as RequestItem[])
        return
      } catch {
        setRequests(mockRequests)
        return
      }
    }

    setRequests(mockRequests)
  }, [])

  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    }
  }, [requests])

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
              statusHistory: [
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: "Статусот е ажуриран од листата со барања.",
                },
                ...request.statusHistory,
              ],
            }
          : request
      )
    )
  }

  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

<Card className="border-none shadow-none bg-transparent">        <CardHeader>
          <CardTitle>Сите барања</CardTitle>
          <CardDescription>
            {filteredRequests.length} пронајдени барањ{filteredRequests.length !== 1 ? "а" : "е"}
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
                onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}
              >
                <SelectTrigger className="w-[170px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите статуси</SelectItem>
                  <SelectItem value="sent">{statusLabels.sent}</SelectItem>
                  <SelectItem value="processing">{statusLabels.processing}</SelectItem>
                  <SelectItem value="reviewed">{statusLabels.reviewed}</SelectItem>
                  <SelectItem value="approved">{statusLabels.approved}</SelectItem>
                  <SelectItem value="rejected">{statusLabels.rejected}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as RequestType | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите типови</SelectItem>
                  <SelectItem value="request">{requestTypeLabels.request}</SelectItem>
                  <SelectItem value="permit">{requestTypeLabels.permit}</SelectItem>
                  <SelectItem value="complaint">{requestTypeLabels.complaint}</SelectItem>
                  <SelectItem value="application">{requestTypeLabels.application}</SelectItem>
                  <SelectItem value="certificate">{requestTypeLabels.certificate}</SelectItem>
                  <SelectItem value="objection">{requestTypeLabels.objection}</SelectItem>
                  <SelectItem value="statement">{requestTypeLabels.statement}</SelectItem>
                  <SelectItem value="report">{requestTypeLabels.report}</SelectItem>
                  <SelectItem value="other">{requestTypeLabels.other}</SelectItem>
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


<div className="rounded-[22px] bg-[#f7f5f2] p-3 shadow-sm overflow-x-auto">
  <Table className="border-separate border-spacing-y-2 text-sm min-w-[1000px]">
    <TableHeader>
      <TableRow className="border-0 bg-transparent hover:bg-transparent">
        <TableHead className="rounded-l-[16px] bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          ID на барање
        </TableHead>
        <TableHead className="bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          Корисник
        </TableHead>
        <TableHead className="bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          Тип
        </TableHead>
        <TableHead className="bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          Наслов
        </TableHead>
        <TableHead className="bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          Поднесено
        </TableHead>
        <TableHead className="bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          Статус
        </TableHead>
        <TableHead className="rounded-r-[16px] bg-orange-200 px-3 py-3 text-center font-semibold text-orange-900">
          Акции
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {filteredRequests.length === 0 ? (
        <TableRow className="border-0 hover:bg-transparent">
          <TableCell
            colSpan={7}
            className="h-24 rounded-[14px] bg-white text-center text-muted-foreground shadow-sm"
          >
            Нема барања што одговараат на критериумите
          </TableCell>
        </TableRow>
      ) : (
        filteredRequests.map((request) => (
          <TableRow key={request.id} className="border-0 bg-transparent text-center">
            
            <TableCell className="rounded-l-[14px] border border-r-0 bg-white px-3 py-3 font-medium text-slate-700 shadow-sm">
              {request.id}
            </TableCell>

            <TableCell className="border-y bg-white px-3 py-3 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3]">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-700">{request.userName}</p>
                  <p className="text-[10px] text-slate-500">{request.userEmail}</p>
                </div>
              </div>
            </TableCell>

            <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
              {requestTypeLabels[request.type] ?? request.type}
            </TableCell>

            <TableCell className="max-w-[160px] truncate border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
              {request.title}
            </TableCell>

            <TableCell className="border-y bg-white px-3 py-3 text-slate-700 shadow-sm">
              {new Date(request.createdAt).toLocaleDateString()}
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
                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "sent")}>
                      {statusLabels.sent}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "processing")}>
                      {statusLabels.processing}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "reviewed")}>
                      {statusLabels.reviewed}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "approved")}>
                      {statusLabels.approved}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, "rejected")}>
                      {statusLabels.rejected}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>

            <TableCell className="rounded-r-[14px] border border-l-0 bg-white px-3 py-3 shadow-sm">
              <div className="flex justify-center">
                <Link href={`/admin/requests/${request.id}`}>
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
              Прикажани {filteredRequests.length} од вкупно {requests.length} барања
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
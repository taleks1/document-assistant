"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { mockRequests, mockDocuments } from "@/lib/mock-data"
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

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

const statusLabels: Record<string, string> = {
  sent: "Поднесено",
  processing: "Во обработка",
  reviewed: "Разгледано",
  approved: "Одобрено",
  rejected: "Одбиено",
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const request = mockRequests.find((r) => r.id === id)
  const documents = mockDocuments.filter((d) => d.requestId === id)

  if (!request) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">Барањето не е пронајдено</h2>
        <p className="mb-4 text-muted-foreground">Барањето што го барате не постои.</p>
        <Link href="/citizen/requests">
          <Button>Назад кон барања</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/citizen/requests"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад кон барања
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{request.id}</h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-muted-foreground">{request.title}</p>
          </div>

          <div className="flex gap-2">
            <Link href={`/citizen/tracking?id=${request.id}`}>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Clock className="h-4 w-4" />
                Следи статус
              </Button>
            </Link>

            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Преземи
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Request Info */}
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>Информации за барањето</CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Тип на барање</p>
                      <p className="text-sm text-muted-foreground">
                        {requestTypeLabels[request.type] || request.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-400">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Датум на поднесување</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString("mk-MK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-2 text-sm font-medium text-foreground">Опис</p>
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>

              {request.notes && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-2 text-sm font-medium text-foreground">Дополнителни белешки</p>
                  <p className="text-sm text-muted-foreground">{request.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Data */}
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>Информации за апликантот</CardTitle>
              <CardDescription>
                Податоци извлечени од вашиот документ за лична идентификација
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Име и презиме</p>
                      <p className="text-sm text-muted-foreground">
                        {request.extractedData.firstName} {request.extractedData.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-400">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Број на личен документ</p>
                      <p className="text-sm text-muted-foreground">{request.extractedData.idNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">ЕМБГ</p>
                      <p className="text-sm text-muted-foreground">{request.extractedData.embg}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-400">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Датум на раѓање</p>
                      <p className="text-sm text-muted-foreground">{request.extractedData.dateOfBirth}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-400">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Важност на документот</p>
                      <p className="text-sm text-muted-foreground">
                        {request.extractedData.documentExpiryDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-400">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Адреса</p>
                      <p className="text-sm text-muted-foreground">{request.extractedData.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision */}
          {request.status === "approved" && (
            <Card className="border-success/20 bg-success/5 shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-success">Барањето е одобрено</h3>
                  <p className="text-sm text-muted-foreground">
                    Вашето барање е одобрено. Можете да го преземете финалниот документ од делот Документи.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {request.status === "rejected" && (
            <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Барањето е одбиено</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.rejectionReason ||
                      "Вашето барање е одбиено. Контактирајте поддршка за повеќе информации."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>Историја на статус</CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <div className="space-y-3">
                {request.statusHistory.map((history, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            index === request.statusHistory.length - 1
                              ? "bg-gradient-to-br from-emerald-400 to-cyan-400"
                              : "bg-slate-200"
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              index === request.statusHistory.length - 1
                                ? "bg-white"
                                : "bg-slate-500"
                            }`}
                          />
                        </div>

                        {index < request.statusHistory.length - 1 && (
                          <div className="mt-1 h-8 w-px bg-border" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {statusLabels[history.status] || history.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(history.timestamp).toLocaleDateString("mk-MK", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {history.note && (
                          <p className="mt-1 text-xs text-muted-foreground">{history.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>Документи</CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Сè уште нема достапни документи.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {requestTypeLabels[doc.type] || doc.type}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle>Прилози</CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <div className="space-y-3">
                {request.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-400">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{attachment}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
"use client"

import { use, useState, useEffect } from "react"
import { formatDate, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  apiGetRequestById,
  apiGetRequestFiles,
  apiDownloadRequestFile,
  apiPreviewRequestFile,
  apiDownloadConfirmationPdf,
  apiDownloadOfficialDocumentPdf,
  DocumentRequestFullResponse,
  RequestFileResponse,
  DocumentRequestTypeLabel,
  DocumentRequestStatusLabel,
} from "@/lib/api"
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
  CreditCard,
  User,
  Paperclip,
} from "lucide-react"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [request, setRequest] = useState<DocumentRequestFullResponse | null>(null)
  const [files, setFiles] = useState<RequestFileResponse[]>([])
  const [downloading, setDownloading] = useState<"confirmation" | "document" | null>(null)

  useEffect(() => {
    const numericId = Number(id)
    apiGetRequestById(numericId).then(setRequest)
    apiGetRequestFiles(numericId).then(setFiles).catch(() => {})
  }, [id])

  async function handleDownload(type: "confirmation" | "document") {
    if (!request) return
    setDownloading(type)
    try {
      if (type === "confirmation") {
        await apiDownloadConfirmationPdf(request.id)
      } else {
        await apiDownloadOfficialDocumentPdf(request.id)
      }
    } finally {
      setDownloading(null)
    }
  }

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
              <h1 className="text-2xl font-bold text-foreground">{request.title}</h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-muted-foreground">{request.referenceNumber}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => handleDownload("confirmation")}
              disabled={downloading !== null}
            >
              {downloading === "confirmation" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Преземи потврда
            </Button>

            {request.status === "APPROVED" && (
              <Button
                className="gap-2 rounded-xl"
                onClick={() => handleDownload("document")}
                disabled={downloading !== null}
              >
                {downloading === "document" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Преземи официјален документ
              </Button>
            )}
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
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-400">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Наслов на барање</p>
                      <p className="text-sm text-muted-foreground">{request.title}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Тип на барање</p>
                      <p className="text-sm text-muted-foreground">
                        {DocumentRequestTypeLabel[request.type] ?? request.type}
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
                        {formatDate(request.createdAt)}
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
                        {request.firstname} {request.lastname}
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
                      <p className="text-sm text-muted-foreground">{request.cardId}</p>
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
                      <p className="text-sm text-muted-foreground">{request.embg}</p>
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
                      <p className="text-sm text-muted-foreground">
                        {formatDate(request.birthDate)}
                      </p>
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
                        {formatDate(request.cardExpiryDate)}
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
                      <p className="text-sm text-muted-foreground">{request.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision */}
          {request.status === "APPROVED" && (
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

          {request.status === "REJECTED" && (
            <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Барањето е одбиено</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.rejectionReason ??
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
                          {DocumentRequestStatusLabel[history.status] ?? history.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(history.timestamp)}
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

          {/* Attachments */}
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Прилози
              </CardTitle>
              <CardDescription>
                {files.length} {files.length === 1 ? "прилог" : "прилози"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4">
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нема прикачени прилози.</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-400">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground" title={file.fileName}>
                            {file.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>

                      <div className="ml-2 flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-slate-500 hover:text-sky-600"
                          title="Прегледај"
                          onClick={() => apiPreviewRequestFile(Number(id), file.id).catch(() => {})}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-slate-500 hover:text-emerald-600"
                          title="Преземи"
                          onClick={() => apiDownloadRequestFile(Number(id), file.id, file.fileName).catch(() => {})}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { formatDateTime } from "@/lib/utils"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  apiAdminGetRequestById,
  apiAdminAcceptRequest,
  apiAdminRejectRequest,
  apiAdminUpdateRequestStatus,
  apiAdminDownloadConfirmationPdf,
  apiAdminDownloadOfficialDocumentPdf,
  DocumentRequestStatusLabel,
  DocumentRequestTypeLabel,
  type DocumentRequestFullResponse,
  type DocumentRequestStatus,
} from "@/lib/api"
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Download,
} from "lucide-react"

const rejectSchema = z.object({
  reason: z.string().trim().min(5, "Причината мора да има најмалку 5 карактери."),
})

const infoSchema = z.object({
  message: z.string().trim().min(5, "Пораката мора да има најмалку 5 карактери."),
})

type RejectFormValues = z.infer<typeof rejectSchema>
type InfoFormValues = z.infer<typeof infoSchema>

export default function AdminRequestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [requestData, setRequestData] = useState<DocumentRequestFullResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloading, setDownloading] = useState<"confirmation" | "document" | null>(null)

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  })

  const infoForm = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: { message: "" },
  })

  useEffect(() => {
    async function fetchRequest() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiAdminGetRequestById(Number(id))
        setRequestData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Грешка при вчитување на барањето")
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [id])

  const handleApprove = async () => {
    if (!requestData) return
    try {
      setIsProcessing(true)
      const updated = await apiAdminAcceptRequest(requestData.id)
      setRequestData(updated)
    } catch (err) {
      console.error("Failed to approve request", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const onRejectSubmit = async (values: RejectFormValues) => {
    if (!requestData) return
    try {
      setIsProcessing(true)
      const updated = await apiAdminRejectRequest(requestData.id, values.reason)
      setRequestData(updated)
      setShowRejectDialog(false)
      rejectForm.reset()
    } catch (err) {
      console.error("Failed to reject request", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const onInfoSubmit = async (values: InfoFormValues) => {
    if (!requestData) return
    try {
      setIsProcessing(true)
      const updated = await apiAdminUpdateRequestStatus(requestData.id, "IN_REVIEW")
      setRequestData(updated)
      setShowInfoDialog(false)
      infoForm.reset()
    } catch (err) {
      console.error("Failed to update status", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (type: "confirmation" | "document") => {
    if (!requestData) return
    setDownloading(type)
    try {
      if (type === "confirmation") {
        await apiAdminDownloadConfirmationPdf(requestData.id)
      } else {
        await apiAdminDownloadOfficialDocumentPdf(requestData.id)
      }
    } finally {
      setDownloading(null)
    }
  }

  const handleStatusChange = async (newStatus: DocumentRequestStatus) => {
    if (!requestData) return
    try {
      const updated = await apiAdminUpdateRequestStatus(requestData.id, newStatus)
      setRequestData(updated)
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Се вчитува барањето...</p>
      </div>
    )
  }

  if (error || !requestData) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">Барањето не е пронајдено</h2>
        <p className="mb-4 text-muted-foreground">{error ?? "Барањето што го бараш не постои."}</p>
        <Link href="/admin/requests">
          <Button>Назад кон барања</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <Link
          href="/admin/requests"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад кон барања
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-2xl font-bold text-foreground">
                {requestData.referenceNumber}
              </h1>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Статус:</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-between gap-2 min-w-[150px] rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      <span className="w-full flex items-center justify-between gap-2">
                        {DocumentRequestStatusLabel[requestData.status]}
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-[150px] rounded-lg border border-gray-200 bg-white shadow-md">
                    {(Object.keys(DocumentRequestStatusLabel) as DocumentRequestStatus[]).map((key) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {DocumentRequestStatusLabel[key]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="mt-1 text-muted-foreground">{requestData.title}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleDownload("confirmation")}
              disabled={downloading !== null}
            >
              {downloading === "confirmation" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Потврда PDF
            </Button>

            {requestData.status === "APPROVED" && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleDownload("document")}
                disabled={downloading !== null}
              >
                {downloading === "document" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Одлука PDF
              </Button>
            )}

            <Button
              variant="outline"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                rejectForm.reset()
                setShowRejectDialog(true)
              }}
            >
              <XCircle className="h-4 w-4" />
              Одбиј
            </Button>

            <Button className="gap-2" onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Одобри
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Информации за граѓанинот</CardTitle>
              <CardDescription>Податоци за подносителот на барањето</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>

                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Име и презиме</p>
                    <p className="font-medium text-foreground">{requestData.userFullName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Е-пошта</p>
                    <p className="font-medium text-foreground">{requestData.userEmail}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Детали за барањето</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Тип на барање</p>
                    <p className="text-sm text-muted-foreground">
                      {DocumentRequestTypeLabel[requestData.type] ?? requestData.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Датум на поднесување</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(requestData.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {requestData.description && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">Опис</p>
                  <p className="text-sm text-muted-foreground">{requestData.description}</p>
                </div>
              )}

              {requestData.notes && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">Дополнителни белешки</p>
                  <p className="text-sm text-muted-foreground">{requestData.notes}</p>
                </div>
              )}

              {requestData.rejectionReason && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-destructive">Причина за одбивање</p>
                  <p className="text-sm text-muted-foreground">{requestData.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Историја на статус</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requestData.statusHistory.map((history, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${index === 0 ? "bg-primary" : "bg-muted"}`}>
                        <div className={`h-2 w-2 rounded-full ${index === 0 ? "bg-primary-foreground" : "bg-muted-foreground"}`} />
                      </div>
                      {index < requestData.statusHistory.length - 1 && (
                        <div className="h-8 w-px bg-border" />
                      )}
                    </div>

                    <div className="pb-4">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open)
          if (!open) rejectForm.reset()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Одбиј барање</DialogTitle>
            <DialogDescription>
              Внеси причина за одбивање на барањето. Корисникот ќе биде известен.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)}>
            <div className="py-4">
              <Label htmlFor="reject-reason">Причина за одбивање</Label>
              <Textarea
                id="reject-reason"
                placeholder="Внеси причина за одбивање..."
                className="mt-2"
                rows={4}
                {...rejectForm.register("reason")}
              />
              {rejectForm.formState.errors.reason && (
                <p className="mt-2 text-sm text-destructive">
                  {rejectForm.formState.errors.reason.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
                Откажи
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isProcessing || rejectForm.formState.isSubmitting}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Потврди одбивање
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showInfoDialog}
        onOpenChange={(open) => {
          setShowInfoDialog(open)
          if (!open) infoForm.reset()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Побарај дополнителни информации</DialogTitle>
            <DialogDescription>
              Побарај од корисникот дополнителни информации или документи.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={infoForm.handleSubmit(onInfoSubmit)}>
            <div className="py-4">
              <Label htmlFor="info-request">Твоја порака</Label>
              <Textarea
                id="info-request"
                placeholder="Опиши кои дополнителни информации ти се потребни..."
                className="mt-2"
                rows={4}
                {...infoForm.register("message")}
              />
              {infoForm.formState.errors.message && (
                <p className="mt-2 text-sm text-destructive">
                  {infoForm.formState.errors.message.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInfoDialog(false)}>
                Откажи
              </Button>
              <Button type="submit" disabled={isProcessing || infoForm.formState.isSubmitting}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Испрати барање
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
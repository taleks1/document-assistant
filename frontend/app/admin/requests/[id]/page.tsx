"use client"

import { useEffect, useState } from "react"
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
import { StatusBadge } from "@/components/status-badge"
import {
  mockRequests,
  mockDocuments,
  requestTypeLabels,
  statusLabels,
  type RequestStatus,
} from "@/lib/mock-data"
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Loader2,
} from "lucide-react"

const STORAGE_KEY = "admin-requests"
type RequestItem = (typeof mockRequests)[number]

const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Причината мора да има најмалку 5 карактери."),
})

const infoSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, "Пораката мора да има најмалку 5 карактери."),
})

type RejectFormValues = z.infer<typeof rejectSchema>
type InfoFormValues = z.infer<typeof infoSchema>

export default function AdminRequestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [requestData, setRequestData] = useState<RequestItem | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
  })

  const infoForm = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      message: "",
    },
  })

  useEffect(() => {
    const savedRequests = localStorage.getItem(STORAGE_KEY)

    if (savedRequests) {
      try {
        const parsed = JSON.parse(savedRequests) as RequestItem[]
        setRequestData(parsed.find((r) => r.id === id) ?? null)
        return
      } catch {
        setRequestData(mockRequests.find((r) => r.id === id) ?? null)
        return
      }
    }

    setRequestData(mockRequests.find((r) => r.id === id) ?? null)
  }, [id])

  useEffect(() => {
    if (!requestData) return

    const savedRequests = localStorage.getItem(STORAGE_KEY)
    let requests: RequestItem[] = mockRequests

    if (savedRequests) {
      try {
        requests = JSON.parse(savedRequests) as RequestItem[]
      } catch {
        requests = mockRequests
      }
    }

    const updatedRequests = requests.map((request) =>
      request.id === requestData.id ? requestData : request
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests))
  }, [requestData])

  const documents = mockDocuments.filter((d) => d.requestId === id)

  if (!requestData) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">Барањето не е пронајдено</h2>
        <p className="mb-4 text-muted-foreground">Барањето што го бараш не постои.</p>
        <Link href="/admin/requests">
          <Button>Назад кон барања</Button>
        </Link>
      </div>
    )
  }

  const handleStatusChange = (newStatus: RequestStatus, note?: string) => {
    setRequestData((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        status: newStatus,
        statusHistory: [
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            ...(note ? { note } : {}),
          },
          ...prev.statusHistory,
        ],
      }
    })
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    handleStatusChange("approved", "Барањето е одобрено од администратор.")
    setIsProcessing(false)
  }

  const onRejectSubmit = async (values: RejectFormValues) => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    handleStatusChange("rejected", values.reason || "Барањето е одбиено од администратор.")
    setIsProcessing(false)
    setShowRejectDialog(false)
    rejectForm.reset()
  }

  const onInfoSubmit = async (values: InfoFormValues) => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    handleStatusChange("processing", values.message || "Побарани се дополнителни информации.")
    setIsProcessing(false)
    setShowInfoDialog(false)
    infoForm.reset()
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{requestData.id}</h1>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <StatusBadge status={requestData.status} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleStatusChange("sent")}>
                    {statusLabels.sent}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("processing")}>
                    {statusLabels.processing}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("reviewed")}>
                    {statusLabels.reviewed}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                    {statusLabels.approved}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                    {statusLabels.rejected}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="mt-1 text-muted-foreground">{requestData.title}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                infoForm.reset()
                setShowInfoDialog(true)
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Побарај информации
            </Button>

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
                    <p className="font-medium text-foreground">{requestData.userName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Е-пошта</p>
                    <p className="font-medium text-foreground">{requestData.userEmail}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Број на документ</p>
                    <p className="font-medium text-foreground">
                      {requestData.extractedData.idNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Датум на раѓање</p>
                    <p className="font-medium text-foreground">
                      {requestData.extractedData.dateOfBirth}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">ЕМБГ</p>
                    <p className="font-medium text-foreground">{requestData.extractedData.embg}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Важност на документ</p>
                    <p className="font-medium text-foreground">
                      {requestData.extractedData.documentExpiryDate}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Адреса</p>
                    <p className="font-medium text-foreground">
                      {requestData.extractedData.address}
                    </p>
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
                      {requestTypeLabels[requestData.type] ?? requestData.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Датум на поднесување</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(requestData.createdAt).toLocaleDateString("mk-MK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-medium text-foreground">Опис</p>
                <p className="text-sm text-muted-foreground">{requestData.description}</p>
              </div>

              {requestData.notes && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Дополнителни белешки
                  </p>
                  <p className="text-sm text-muted-foreground">{requestData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>AI извлечени податоци</CardTitle>
              <CardDescription>Информации извлечени од прикачениот документ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Име и презиме</p>
                      <p className="text-sm text-muted-foreground">
                        {requestData.extractedData.firstName} {requestData.extractedData.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Број на документ</p>
                      <p className="text-sm text-muted-foreground">
                        {requestData.extractedData.idNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Датум на раѓање</p>
                      <p className="text-sm text-muted-foreground">
                        {requestData.extractedData.dateOfBirth}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Адреса</p>
                      <p className="text-sm text-muted-foreground">
                        {requestData.extractedData.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">ЕМБГ</p>
                      <p className="text-sm text-muted-foreground">
                        {requestData.extractedData.embg}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Важност на документ</p>
                      <p className="text-sm text-muted-foreground">
                        {requestData.extractedData.documentExpiryDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Преглед на генериран документ</CardTitle>
              <CardDescription>Автоматски генериран документ за барањето</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-6 border-b border-border pb-4 text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    ФОРМУЛАР ЗА АДМИНИСТРАТИВНО БАРАЊЕ
                  </h2>
                  <p className="text-sm text-muted-foreground">Портал за владини услуги</p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Тип на барање
                      </p>
                      <p className="font-medium text-foreground">
                        {requestTypeLabels[requestData.type] ?? requestData.type}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        ID на барање
                      </p>
                      <p className="font-medium text-foreground">{requestData.id}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Информации за апликантот
                    </p>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">Име:</span>{" "}
                        {requestData.extractedData.firstName} {requestData.extractedData.lastName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Број на документ:</span>{" "}
                        {requestData.extractedData.idNumber}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ЕМБГ:</span>{" "}
                        {requestData.extractedData.embg}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Важност:</span>{" "}
                        {requestData.extractedData.documentExpiryDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Преземи PDF
                </Button>
              </div>
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
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          index === 0 ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            index === 0 ? "bg-primary-foreground" : "bg-muted-foreground"
                          }`}
                        />
                      </div>
                      {index < requestData.statusHistory.length - 1 && (
                        <div className="h-8 w-px bg-border" />
                      )}
                    </div>

                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">
                        {statusLabels[history.status] ?? history.status}
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Прикачени документи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requestData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{attachment}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{document.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Брзи акции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Експортирај барање
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Испечати преглед
              </Button>
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
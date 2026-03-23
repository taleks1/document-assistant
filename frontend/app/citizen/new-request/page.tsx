"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Loader2, CheckCircle, X, Brain } from "lucide-react"
import { mockRequests } from "@/lib/mock-data"

const requestTypeLabels: Record<string, string> = {
  request: "Барање",
  permit: "Дозвола",
  complaint: "Жалба",
  application: "Апликација",
  objection: "Приговор",
  certificate: "Потврда",
  statement: "Изјава",
  report: "Пријава",
  other: "Друго",
}

const newRequestSchema = z.object({
  firstName: z.string().trim().min(2, "Името мора да има најмалку 2 карактери."),
  lastName: z.string().trim().min(2, "Презимето мора да има најмалку 2 карактери."),
  idNumber: z.string().trim().min(3, "Внеси валиден број на личен документ."),
  address: z.string().trim().min(5, "Адресата мора да има најмалку 5 карактери."),
  dateOfBirth: z.string().min(1, "Датумот на раѓање е задолжителен."),
  embg: z.string().trim().regex(/^\d{13}$/, "ЕМБГ мора да содржи точно 13 цифри."),
  documentExpiryDate: z.string().min(1, "Важноста на документот е задолжителна."),
  requestType: z.string().min(1, "Избери тип на барање."),
  requestTitle: z.string().trim().min(3, "Насловот мора да има најмалку 3 карактери."),
  description: z.string().trim().min(10, "Описот мора да има најмалку 10 карактери."),
  notes: z.string().optional(),
})

type NewRequestFormValues = z.infer<typeof newRequestSchema>

export default function NewRequestPage() {
  const router = useRouter()

  const [step, setStep] = useState<"upload" | "form" | "preview">("upload")
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [submittedData, setSubmittedData] = useState<NewRequestFormValues | null>(null)

  const form = useForm<NewRequestFormValues>({
    resolver: zodResolver(newRequestSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      idNumber: "",
      address: "",
      dateOfBirth: "",
      embg: "",
      documentExpiryDate: "",
      requestType: "request",
      requestTitle: "",
      description: "",
      notes: "",
    },
  })

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]

    if (file && (file.type.includes("image") || file.type === "application/pdf")) {
      setUploadedFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      setUploadedFile(file)
    }
  }, [])

  const handleExtract = async () => {
    if (!uploadedFile) return

    setIsExtracting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const userRequest = mockRequests.find((r) => r.userId === "1")

    form.reset({
      firstName: userRequest?.extractedData?.firstName ?? "",
      lastName: userRequest?.extractedData?.lastName ?? "",
      idNumber: userRequest?.extractedData?.idNumber ?? "",
      address: userRequest?.extractedData?.address ?? "",
      dateOfBirth: userRequest?.extractedData?.dateOfBirth ?? "",
      embg: userRequest?.extractedData?.embg ?? "",
      documentExpiryDate: userRequest?.extractedData?.documentExpiryDate ?? "",
      requestType: userRequest?.type ?? "request",
      requestTitle: userRequest?.title ?? "",
      description: userRequest?.description ?? "",
      notes: userRequest?.notes ?? "",
    })

    setIsExtracting(false)
    setStep("form")
  }

  const onFormSubmit = (values: NewRequestFormValues) => {
    setSubmittedData(values)
    setStep("preview")
    console.log(values)
  }

  const handleSubmitFinal = async () => {
    if (!submittedData) return

    setIsSubmitting(true)

    try {
      const newRequest = {
        id: `REQ-${Date.now()}`,
        userId: "1",
        type: submittedData.requestType,
        title: submittedData.requestTitle,
        description: submittedData.description,
        notes: submittedData.notes ?? "",
        status: "sent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extractedData: {
          firstName: submittedData.firstName,
          lastName: submittedData.lastName,
          idNumber: submittedData.idNumber,
          address: submittedData.address,
          dateOfBirth: submittedData.dateOfBirth,
          embg: submittedData.embg,
          documentExpiryDate: submittedData.documentExpiryDate,
        },
        attachments: [
          ...(uploadedFile ? [uploadedFile.name] : []),
          ...additionalFiles.map((file) => file.name),
        ],
        statusHistory: [
          {
            status: "sent",
            date: new Date().toISOString(),
            note: "Барањето е успешно поднесено.",
          },
        ],
      }

      console.log("FINAL SUBMIT:", newRequest)

      // Тука подоцна ќе ставиш backend/API повик
      // await fetch("/api/requests", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(newRequest),
      // })

      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/citizen/requests")
    } catch (error) {
      console.error("Грешка при поднесување:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdditionalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAdditionalFiles((prev) => [...prev, ...files])
  }

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const previewData = submittedData ?? form.getValues()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Ново барање</h1>
        <p className="text-muted-foreground">
          Поднесете ново административно барање со помош на AI обработка на документи
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Полињата означени со <span className="font-semibold text-red-500">*</span> се
          задолжителни.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              step === "upload" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "bg-green-600 text-white"
              }`}
            >
              {step !== "upload" ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <span className="text-sm font-medium">Прикачи личен документ</span>
          </div>

          <div className="h-px w-8 bg-border" />

          <div
            className={`flex items-center gap-2 ${
              step === "form" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === "form"
                  ? "bg-primary text-primary-foreground"
                  : step === "preview"
                    ? "bg-green-600 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step === "preview" ? <CheckCircle className="h-5 w-5" /> : "2"}
            </div>
            <span className="text-sm font-medium">Пополнете детали</span>
          </div>

          <div className="h-px w-8 bg-border" />

          <div
            className={`flex items-center gap-2 ${
              step === "preview" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </div>
            <span className="text-sm font-medium">Преглед и поднесување</span>
          </div>
        </div>
      </div>

      {step === "upload" && (
        <div className="mx-auto max-w-2xl">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Прикачете документ за идентификација</CardTitle>
              <CardDescription>
                Прикачете лична карта, пасош или возачка дозвола. Нашата AI алатка автоматски ќе ги
                извлече вашите податоци.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  uploadedFile
                    ? "border-green-600 bg-green-50"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {uploadedFile ? (
                  <>
                    <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
                    <p className="mb-2 font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => setUploadedFile(null)}
                    >
                      Отстрани и прикачи друг документ
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 font-medium text-foreground">
                      Повлечете и пуштете го вашиот документ
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      или кликнете за избор на датотека
                    </p>

                    <label htmlFor="file-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>Избери датотека</span>
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>

                    <p className="mt-4 text-xs text-muted-foreground">
                      Поддржани формати: JPG, PNG, PDF (макс. 10MB)
                    </p>
                  </>
                )}
              </div>

              {uploadedFile && (
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={handleExtract}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Се извлекуваат податоци...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Извлечи информации со AI
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="mx-auto max-w-3xl space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Податоците се успешно извлечени од вашиот документ. Проверете ги и изменете ако е
              потребно.
            </AlertDescription>
          </Alert>

          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Извлечени информации</CardTitle>
              <CardDescription>
                Проверете ги и изменете ги AI-извлечените податоци од вашиот документ
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Име <span className="text-red-500">*</span>
                </Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Презиме <span className="text-red-500">*</span>
                </Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">
                  Број на личен документ <span className="text-red-500">*</span>
                </Label>
                <Input id="idNumber" {...form.register("idNumber")} />
                {form.formState.errors.idNumber && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.idNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Датум на раѓање <span className="text-red-500">*</span>
                </Label>
                <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="embg">
                  Матичен број (ЕМБГ) <span className="text-red-500">*</span>
                </Label>
                <Input id="embg" type="text" maxLength={13} {...form.register("embg")} />
                {form.formState.errors.embg && (
                  <p className="text-sm text-destructive">{form.formState.errors.embg.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentExpiryDate">
                  Важност на документот <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="documentExpiryDate"
                  type="date"
                  {...form.register("documentExpiryDate")}
                />
                {form.formState.errors.documentExpiryDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.documentExpiryDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">
                  Адреса <span className="text-red-500">*</span>
                </Label>
                <Input id="address" {...form.register("address")} />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Детали за барањето</CardTitle>
              <CardDescription>Внесете дополнителни информации за вашето барање</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="requestType">
                    Тип на барање <span className="text-red-500">*</span>
                  </Label>

                  <Controller
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Избери тип на барање" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="request">Барање</SelectItem>
                          <SelectItem value="permit">Дозвола</SelectItem>
                          <SelectItem value="complaint">Жалба</SelectItem>
                          <SelectItem value="application">Апликација</SelectItem>
                          <SelectItem value="objection">Приговор</SelectItem>
                          <SelectItem value="certificate">Потврда</SelectItem>
                          <SelectItem value="statement">Изјава</SelectItem>
                          <SelectItem value="report">Пријава</SelectItem>
                          <SelectItem value="other">Друго</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {form.formState.errors.requestType && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.requestType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestTitle">
                    Наслов на барањето <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requestTitle"
                    placeholder="пр. Барање за градежна дозвола"
                    {...form.register("requestTitle")}
                  />
                  {form.formState.errors.requestTitle && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.requestTitle.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Опис <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Опишете го вашето барање подетално..."
                  rows={4}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Дополнителни забелешки (опционално)</Label>
                <Textarea
                  id="notes"
                  placeholder="Дополнителни информации или посебни барања..."
                  rows={2}
                  {...form.register("notes")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Дополнителни прилози</CardTitle>
              <CardDescription>
                Прикачете дополнителни документи за поддршка (опционално)
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {additionalFiles.length > 0 && (
                  <div className="space-y-2">
                    {additionalFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeAdditionalFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <label htmlFor="additional-files">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Додај прилози
                    </span>
                  </Button>
                  <input
                    id="additional-files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAdditionalFiles}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep("upload")}>
              Назад
            </Button>
            <Button type="submit">Генерирај документ</Button>
          </div>
        </form>
      )}

      {step === "preview" && previewData && (
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Преглед на документ</CardTitle>
              <CardDescription>Проверете го генерираниот документ пред поднесување</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-6 border-b border-border pb-4 text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    ОБРАЗЕЦ ЗА АДМИНИСТРАТИВНО БАРАЊЕ
                  </h2>
                  <p className="text-sm text-muted-foreground">Портал за јавни услуги</p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Тип на барање
                      </p>
                      <p className="font-medium text-foreground">
                        {requestTypeLabels[previewData.requestType] || previewData.requestType}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Наслов на барање
                      </p>
                      <p className="font-medium text-foreground">{previewData.requestTitle}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Податоци за апликантот
                    </p>

                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">Име:</span>{" "}
                        {previewData.firstName} {previewData.lastName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Број на личен документ:</span>{" "}
                        {previewData.idNumber}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Датум на раѓање:</span>{" "}
                        {previewData.dateOfBirth}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ЕМБГ:</span> {previewData.embg}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Важност на документот:</span>{" "}
                        {previewData.documentExpiryDate}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="text-muted-foreground">Адреса:</span> {previewData.address}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Опис
                    </p>
                    <p className="text-sm text-foreground">{previewData.description}</p>
                  </div>

                  {previewData.notes && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                        Дополнителни забелешки
                      </p>
                      <p className="text-sm text-foreground">{previewData.notes}</p>
                    </div>
                  )}

                  {additionalFiles.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                        Прилози
                      </p>
                      <ul className="list-inside list-disc text-sm text-foreground">
                        {additionalFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep("form")}>
              Измени
            </Button>
            <Button
              type="button"
              onClick={handleSubmitFinal}
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Потврди и поднеси
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
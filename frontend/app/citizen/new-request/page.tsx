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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Upload, FileText, Loader2, CheckCircle, X, Brain, AlertCircle, CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { apiOcrUpload, apiCreateRequest, apiUploadRequestFiles } from "@/lib/api"

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
  dateOfBirth: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Внеси датум во формат ДД.ММ.ГГГГ (пр. 18.08.1979)."),
  embg: z.string().trim().regex(/^\d{13}$/, "ЕМБГ мора да содржи точно 13 цифри."),
  documentExpiryDate: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Внеси датум во формат ДД.ММ.ГГГГ (пр. 19.06.2025)."),
  requestType: z.string().min(1, "Избери тип на барање."),
  requestTitle: z.string().trim().min(3, "Насловот мора да има најмалку 3 карактери."),
  description: z.string().trim().min(10, "Описот мора да има најмалку 10 карактери."),
  notes: z.string().optional(),
})

type NewRequestFormValues = z.infer<typeof newRequestSchema>

function DatePickerField({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const parsed = value ? parse(value, "dd.MM.yyyy", new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full items-center rounded-md border bg-transparent px-3 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          {value || ""}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "dd.MM.yyyy"))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export default function NewRequestPage() {
  const router = useRouter()

  const [step, setStep] = useState<"upload" | "form" | "preview">("upload")
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [ocrUsed, setOcrUsed] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<NewRequestFormValues | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.includes("image") || f.type === "application/pdf"
    )
    if (dropped.length > 0) {
      setUploadedFiles((prev) => [...prev, ...dropped])
      setOcrError(null)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > 0) {
      setUploadedFiles((prev) => [...prev, ...selected])
      setOcrError(null)
      e.target.value = ""
    }
  }, [])

  const handleExtract = async () => {
    if (uploadedFiles.length === 0) return

    setIsExtracting(true)
    setOcrError(null)

    try {
      const data = await apiOcrUpload(uploadedFiles)
      const fields_en = data?.parsed?.fields_en ?? {}
      const fields_mk = data?.parsed?.fields_mk ?? {}
      const fields = { ...fields_en, ...fields_mk }
      const hasData = !!(fields.name || fields.surname || fields.idNumber || fields.embg)

      if (!hasData) {
        setOcrError("AI не успеа да извлече податоци од документот. Обидете се со подобра слика или прескокнете.")
        return
      }

      form.reset({
        firstName: fields.name ?? "",
        lastName: fields.surname ?? "",
        idNumber: fields.idNumber ?? "",
        address: fields.address ?? "",
        dateOfBirth: fields.birthDate ?? "",
        embg: String(fields.embg ?? ""),
        documentExpiryDate: fields.expiryDate ?? "",
        requestType: "request",
        requestTitle: "",
        description: "",
        notes: "",
      })

      setOcrUsed(true)
      setStep("form")
    } catch {
      setOcrError("Неуспешно извлекување на податоци. Обидете се повторно или прескокнете.")
    } finally {
      setIsExtracting(false)
    }
  }

  const onFormSubmit = (values: NewRequestFormValues) => {
    setSubmittedData(values)
    setStep("preview")
  }

  const handleSubmitFinal = async () => {
    if (!submittedData) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const created = await apiCreateRequest({
        type: submittedData.requestType.toUpperCase(),
        title: submittedData.requestTitle,
        description: submittedData.description,
        notes: submittedData.notes || null,
      })

      if (additionalFiles.length > 0) {
        await apiUploadRequestFiles(created.id, additionalFiles)
      }

      router.push("/citizen/requests")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Грешка при поднесување.")
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
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 font-medium text-foreground">
                  Повлечете и пуштете документи овде
                </p>
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>Избери датотеки</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="mt-4 text-xs text-muted-foreground">
                  Поддржани формати: JPG, PNG, PDF (макс. 10MB)
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                          setOcrError(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {ocrError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{ocrError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                {uploadedFiles.length > 0 && (
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
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep("form")}
                  disabled={isExtracting}
                >
                  Прескокни и пополни рачно
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="mx-auto max-w-3xl space-y-6">

          <Card className="border-none bg-white shadow-none">
            <CardHeader>
              <CardTitle>Лични податоци</CardTitle>
              {ocrUsed && (
                <CardDescription>
                  Проверете ги и изменете ги податоците ако не се правилни
                </CardDescription>
              )}
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
                <Label>Датум на раѓање <span className="text-red-500">*</span></Label>
                <Controller
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <DatePickerField value={field.value} onChange={field.onChange} />
                  )}
                />
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
                <Label>Важност на документот <span className="text-red-500">*</span></Label>
                <Controller
                  control={form.control}
                  name="documentExpiryDate"
                  render={({ field }) => (
                    <DatePickerField value={field.value} onChange={field.onChange} />
                  )}
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

          <Card className="border-none bg-white shadow-none">
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

          <Card className="border-none bg-white shadow-none">
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

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

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

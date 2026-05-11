"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse, isValid } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, CheckCircle, Brain, Upload, X, AlertCircle, CalendarIcon } from "lucide-react"
import { apiOcrUpload, apiUpdateUser } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const schema = z.object({
  firstName: z.string().min(2, "Името мора да има најмалку 2 карактери").or(z.literal("")),
  lastName: z.string().min(2, "Презимето мора да има најмалку 2 карактери").or(z.literal("")),
  embg: z.string().length(13, "ЕМБГ мора да има точно 13 цифри").or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Внеси датум во формат ДД.ММ.ГГГГ").or(z.literal("")),
  address: z.string().optional().default(""),
})

type FormValues = z.infer<typeof schema>

function DatePickerField({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
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
          {value || <span className="text-muted-foreground">{placeholder}</span>}
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

function dotDateToIso(dotDate: string): string {
  const [day, month, year] = dotDate.split(".")
  return `${year}-${month}-${day}`
}

export default function ScanIdPage() {
  const router = useRouter()
  const { refreshUser, user } = useAuth()

  const [step, setStep] = useState<"upload" | "form">("upload")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", embg: "", dateOfBirth: "", address: "" },
  })

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > 0) {
      setUploadedFiles((prev) => [...prev, ...selected])
      setOcrError(null)
      e.target.value = ""
    }
  }, [])

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

  const handleExtract = async () => {
    if (uploadedFiles.length === 0) return
    setLoading(true)
    setOcrError(null)
    try {
      const data = await apiOcrUpload(uploadedFiles)
      const fields_en = data?.parsed?.fields_en ?? {}
      const fields_mk = data?.parsed?.fields_mk ?? {}
      const fields = { ...fields_en, ...fields_mk }

      const hasData = !!(fields.name || fields.surname || fields.embg)
      if (!hasData) {
        setOcrError("AI не успеа да извлече податоци. Обидете се со подобра слика.")
        return
      }

      setExtractedFields({ ...fields_en, ...fields_mk })
      form.reset({
        firstName: fields.name ?? "",
        lastName: fields.surname ?? "",
        embg: String(fields.embg ?? ""),
        dateOfBirth: fields.birthDate ?? "",
        address: fields.address ?? "",
      })
      setStep("form")
    } catch {
      setOcrError("Неуспешно извлекување на податоци. Обидете се повторно.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setSaveError(null)
    try {
      await apiUpdateUser({
        ...(values.firstName && { firstname: values.firstName }),
        ...(values.lastName && { lastname: values.lastName }),
        ...(values.embg && { embg: values.embg }),
        ...(values.dateOfBirth && { birthDate: dotDateToIso(values.dateOfBirth) }),
        ...(values.address && { address: values.address }),
        ...(extractedFields.idNumber && { cardId: extractedFields.idNumber }),
        ...(extractedFields.issueDate && { cardIssueDate: dotDateToIso(extractedFields.issueDate) }),
        ...(extractedFields.expiryDate && { cardExpiryDate: dotDateToIso(extractedFields.expiryDate) }),
        ...(extractedFields.nationality && { nationality: extractedFields.nationality }),
        ...(extractedFields.gender && { gender: extractedFields.gender }),
      })
      await refreshUser()
      router.push("/citizen/profile")
    } catch {
      setSaveError("Неуспешно зачувување на податоците. Обидете се повторно.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Скенирање личен документ</h1>

      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Прикачи документ</CardTitle>
            <CardDescription>
              Прикачете предна и задна страна за подобро извлекување на податоци
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-foreground">Повлечете и пуштете документи овде</p>
              <p className="mb-4 text-sm text-muted-foreground">или кликнете за избор</p>
              <label htmlFor="scan-upload">
                <Button type="button" variant="outline" asChild>
                  <span>Избери датотеки</span>
                </Button>
                <input
                  id="scan-upload"
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="mt-4 text-xs text-muted-foreground">JPG, PNG, PDF (макс. 10MB)</p>
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
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}
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

            {uploadedFiles.length > 0 && (
              <Button className="w-full gap-2" onClick={handleExtract} disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Се скенира...</>
                ) : (
                  <><Brain className="h-4 w-4" />Извлечи податоци со AI</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {step === "form" && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Податоци</CardTitle>
              <CardDescription>Проверете ги и изменете ги извлечените информации</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Име</Label>
                <Input placeholder={user?.firstname ?? ""} {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Презиме</Label>
                <Input placeholder={user?.lastname ?? ""} {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>ЕМБГ</Label>
                <Input maxLength={13} placeholder={user?.embg ?? ""} {...form.register("embg")} />
                {form.formState.errors.embg && (
                  <p className="text-sm text-destructive">{form.formState.errors.embg.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Датум на раѓање</Label>
                <Controller
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <DatePickerField value={field.value} onChange={field.onChange} placeholder={user?.birthDate ?? ""} />
                  )}
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Адреса</Label>
                <Input placeholder={user?.address ?? ""} {...form.register("address")} />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep("upload")}>
              Назад
            </Button>
            <Button type="submit" className="gap-2" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Зачувај
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, Brain, Upload, X } from "lucide-react"

const schema = z.object({
  firstName: z.string().min(2, "Името мора да има најмалку 2 карактери"),
  lastName: z.string().min(2, "Презимето мора да има најмалку 2 карактери"),
  embg: z.string().length(13, "ЕМБГ мора да има точно 13 цифри"),
  dateOfBirth: z.string().min(1, "Датумот на раѓање е задолжителен"),
  address: z.string().min(3, "Адресата е задолжителна"),
})

type FormValues = z.infer<typeof schema>

export default function ScanIdPage() {
  const router = useRouter()

  const [step, setStep] = useState<"upload" | "form">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      embg: "",
      dateOfBirth: "",
      address: "",
    },
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleExtract = async () => {
    if (!file) return

    setLoading(true)

    await new Promise((r) => setTimeout(r, 1500))

    form.reset({
      firstName: "John",
      lastName: "Citizen",
      embg: "1234567890123",
      dateOfBirth: "2001-05-10",
      address: "Скопје, Македонија",
    })

    setLoading(false)
    setStep("form")
  }

  const onSubmit = async (values: FormValues) => {
    localStorage.setItem("profileData", JSON.stringify(values))
    await new Promise((r) => setTimeout(r, 800))
    router.push("/citizen/profile")
  }

  const removeFile = () => setFile(null)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Скенирање личен документ
      </h1>

      {/* UPLOAD */}
      {step === "upload" && (
      <Card>
        <CardHeader>
          <CardTitle>Прикачи документ</CardTitle>
          <CardDescription>
            Лична карта или пасош - AI автоматски извлекува податоци
          </CardDescription>
        </CardHeader>

        <CardContent>
          <label className="block cursor-pointer">
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition ${
                file ? "border-green-500 bg-green-50" : "hover:bg-muted/40"
              }`}
            >
              {!file ? (
                <>
                  <Upload className="mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Кликни или прикачи документ
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="text-green-600" />

                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Отстрани и прикачи друг документ
                  </Button>
                </div>
              )}
            </div>

            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFile}
            />
          </label>

          {file && (
            <Button
              className="w-full mt-4"
              onClick={handleExtract}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Се скенира...
                </>
              ) : (
                <>
                  <Brain className="mr-2" />
                  Извлечи податоци
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      )}

      {/* FORM */}
      {step === "form" && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Податоци</CardTitle>
              <CardDescription>
                Проверете ги извлечените информации
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Име</Label>
                <Input {...form.register("firstName")} />
              </div>

              <div className="space-y-2">
                <Label>Презиме</Label>
                <Input {...form.register("lastName")} />
              </div>

              <div className="space-y-2">
                <Label>ЕМБГ</Label>
                <Input {...form.register("embg")} />
              </div>

              <div className="space-y-2">
                <Label>Датум на раѓање</Label>
                <Input type="date" {...form.register("dateOfBirth")} />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label>Адреса</Label>
                <Input {...form.register("address")} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("upload")}
            >
              Назад
            </Button>

            <Button type="submit" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Зачувај
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
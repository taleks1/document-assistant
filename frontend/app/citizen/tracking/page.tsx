"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { mockRequests } from "@/lib/mock-data"
import {
  Search,
  ArrowRight,
  CheckCircle,
  Clock,
  FileSearch,
  Send,
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

const statusSteps = [
  { key: "sent", label: "Поднесено", icon: Send, description: "Барањето е успешно поднесено" },
  { key: "processing", label: "Во обработка", icon: Clock, description: "Се разгледува од службеник" },
  { key: "reviewed", label: "Разгледано", icon: FileSearch, description: "Разгледувањето е завршено" },
  { key: "approved", label: "Одобрено", icon: CheckCircle, description: "Барањето е одобрено" },
]

const trackingSchema = z.object({
  requestId: z.string().trim().min(1, "Внесете ID на барањето"),
})

type TrackingFormValues = z.infer<typeof trackingSchema>

export default function StatusTrackingPage() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get("id") || ""

  const [searchedRequest, setSearchedRequest] = useState(
    initialId ? mockRequests.find((r) => r.id === initialId) : null
  )

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      requestId: initialId,
    },
  })

  const requestIdValue = form.watch("requestId")

  const onSubmit = ({ requestId }: TrackingFormValues) => {
    const normalizedId = requestId.trim().toUpperCase()

    const found = mockRequests.find(
      (r) =>
        r.id.toUpperCase() === normalizedId ||
        r.id.toUpperCase().includes(normalizedId)
    )

    setSearchedRequest(found || null)
  }

  const getStepStatus = (stepKey: string) => {
    if (!searchedRequest) return "pending"
    const statusOrder = ["sent", "processing", "reviewed", "approved"]
    const currentIndex = statusOrder.indexOf(
      searchedRequest.status === "rejected" ? "reviewed" : searchedRequest.status
    )
    const stepIndex = statusOrder.indexOf(stepKey)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "pending"
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Следење статус</h1>
        <p className="text-muted-foreground">Следете го напредокот на вашите административни барања</p>
      </div>

      {/* Search */}
      <Card className="mx-auto mb-8 max-w-2xl border-border">
        <CardHeader>
          <CardTitle>Следете го вашето барање</CardTitle>
          <CardDescription>Внесете ID на барањето за да го видите статусот</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Внесете ID (пр. REQ-2024-001)"
                  className="pl-10"
                  {...form.register("requestId")}
                />
              </div>

              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Провери
              </Button>
            </div>

            {form.formState.errors.requestId && (
              <p className="mt-2 text-sm text-destructive">
                {form.formState.errors.requestId.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searchedRequest ? (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle>{searchedRequest.id}</CardTitle>
                  <StatusBadge status={searchedRequest.status} />
                </div>
                <CardDescription className="mt-1">{searchedRequest.title}</CardDescription>
              </div>
              <Link href={`/citizen/requests/${searchedRequest.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  Детали
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Тип:</span>{" "}
                  <span className="text-foreground">
                    {requestTypeLabels[searchedRequest.type] || searchedRequest.type}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Поднесено:</span>{" "}
                  <span className="text-foreground">
                    {new Date(searchedRequest.createdAt).toLocaleDateString("mk-MK")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Последно ажурирање:</span>{" "}
                  <span className="text-foreground">
                    {new Date(searchedRequest.updatedAt).toLocaleDateString("mk-MK")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Статус</CardTitle>
              <CardDescription>Моментален статус на барањето</CardDescription>
            </CardHeader>
            <CardContent>
              {searchedRequest.status === "rejected" ? (
                <div className="space-y-6">
                  <div className="flex items-center">
                    {statusSteps.slice(0, 3).map((step, index) => {
                      const StepIcon = step.icon
                      const status = getStepStatus(step.key)
                      return (
                        <div key={step.key} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                                status === "completed" || status === "current"
                                  ? "border-success bg-success text-success-foreground"
                                  : "border-border bg-muted text-muted-foreground"
                              }`}
                            >
                              {status === "completed" || status === "current" ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <StepIcon className="h-6 w-6" />
                              )}
                            </div>
                            <span className="mt-2 text-sm font-medium">{step.label}</span>
                            <span className="text-center text-xs text-muted-foreground">
                              {step.description}
                            </span>
                          </div>
                          {index < 2 && <div className="mx-2 h-1 flex-1 rounded bg-border" />}
                        </div>
                      )
                    })}
                    <div className="mx-2 h-1 flex-1 rounded bg-destructive" />
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
                        <XCircle className="h-6 w-6" />
                      </div>
                      <span className="mt-2 text-sm font-medium text-destructive">Одбиено</span>
                      <span className="text-xs text-muted-foreground">Барањето е одбиено</span>
                    </div>
                  </div>

                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex items-start gap-4 p-4">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Причина за одбивање</p>
                        <p className="text-sm text-muted-foreground">
                          {searchedRequest.rejectionReason || "Нема наведена причина"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const status = getStepStatus(step.key)
                    return (
                      <div key={step.key} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                              status === "completed"
                                ? "bg-success text-success-foreground"
                                : status === "current"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {status === "completed" ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <StepIcon className="h-6 w-6" />
                            )}
                          </div>
                          <span className="mt-2 text-sm font-medium">{step.label}</span>
                          <span className="text-center text-xs text-muted-foreground">
                            {step.description}
                          </span>
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className="mx-2 h-1 flex-1 rounded bg-border" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Историја</CardTitle>
              <CardDescription>Детален преглед на активностите</CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : requestIdValue && !searchedRequest ? (
        <Card className="mx-auto max-w-2xl border-border">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Барањето не е пронајдено</h3>
            <p className="text-center text-muted-foreground">
              Не постои барање со ID "{requestIdValue}"
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto max-w-2xl border-border">
          <CardContent className="flex flex-col items-center py-12">
            <FileSearch className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Внесете ID</h3>
            <p className="text-muted-foreground">Внесете ID за да го следите статусот</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
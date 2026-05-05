"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCitizenStats } from "@/lib/mock-data"
import { User, Save, CheckCircle, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const profileSchema = z.object({
  name: z.string().trim().min(2, "Името и презимето мора да има најмалку 2 карактери"),
  email: z.string().trim().email("Внесете валидна е-пошта"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const stats = getCitizenStats("1")

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "Јован Граѓанин",
      email: user?.email || "citizen@example.com",
      phone: "",
      address: "",
    },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Зачувани податоци:", values)

    setIsSaving(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Профил</h1>
        <p className="text-muted-foreground">
          Управувајте со поставките и преференците на вашата сметка
        </p>
      </div>

      <Separator />

      {showSuccess && (
        <Alert className="mb-6 border-success/20 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Вашиот профил е успешно ажуриран.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Лични информации</CardTitle>
                  <CardDescription>Ажурирајте ги вашите лични податоци</CardDescription>
                </div>

                {!isEditing ? (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                    Измени
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Откажи
                    </Button>
                    <Button type="submit" disabled={isSaving} className="gap-2">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Се зачувува...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Зачувај
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Име и презиме</Label>
                    <Input id="name" disabled={!isEditing} {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Е-пошта</Label>
                    <Input
                      id="email"
                      type="email"
                      disabled={!isEditing}
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" disabled={!isEditing} {...form.register("phone")} />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Адреса</Label>
                    <Input id="address" disabled={!isEditing} {...form.register("address")} />
                    {form.formState.errors.address && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          <Separator />

        </div>

    <div className="grid lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">
    <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Брзи акции</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button type="button" variant="outline" className="w-full justify-start rounded-xl">
                Преземи ги моите податоци
              </Button>

              <Button type="button" variant="outline" className="w-full justify-start rounded-xl">
                Побарај бришење на сметка
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10"
              >
                Одјави се
              </Button>
            </CardContent>
          </Card>
  </div>
</div>
      </div>
  
  )
}
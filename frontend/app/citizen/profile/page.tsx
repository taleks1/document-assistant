"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Save,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Shield,
  Calendar,
  Globe,
  Upload,
  Trash2,
  CreditCard,
  Pencil,
  Plus,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

import {
  apiUpdateUser,
  apiGetUserIdentityDocuments,
  apiDeleteUserIdentityDocument,
  apiUpdateUserIdentityDocument,
  apiSaveUserIdentityDocument,
  UserIdentityDocumentResponse,
  DocumentType,
  User as ApiUser,
} from "@/lib/api"

const profileSchema = z.object({
  firstname: z.string().trim().min(2, "Името мора да има најмалку 2 карактери"),
  lastname: z.string().trim().min(2, "Презимето мора да има најмалку 2 карактери"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  embg: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  cardId: z.string().trim().optional(),
  birthDate: z.string().trim().optional(),
  cardIssueDate: z.string().trim().optional(),
  cardExpiryDate: z.string().trim().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, refreshUser } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [savedDocs, setSavedDocs] = useState<UserIdentityDocumentResponse[]>([])
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
  const [editingDoc, setEditingDoc] = useState<UserIdentityDocumentResponse | null>(null)
  const [editForm, setEditForm] = useState({ documentType: "" as DocumentType, documentNumber: "", issueDate: "", expiryDate: "" })
  const [savingDoc, setSavingDoc] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [addingDoc, setAddingDoc] = useState(false)
  const [addForm, setAddForm] = useState({ documentType: "ID_CARD" as DocumentType, documentNumber: "", issueDate: "", expiryDate: "" })
  const [addError, setAddError] = useState<string | null>(null)

  const loadDocuments = useCallback(() => {
    apiGetUserIdentityDocuments().then(setSavedDocs).catch(() => {})
  }, [])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      embg: user?.embg || "",
      gender: user?.gender || "",
      nationality: user?.nationality || "",
      cardId: user?.cardId || "",
      birthDate: user?.birthDate || "",
      cardIssueDate: user?.cardIssueDate || "",
      cardExpiryDate: user?.cardExpiryDate || "",
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        embg: user.embg || "",
        gender: user.gender || "",
        nationality: user.nationality || "",
        cardId: user.cardId || "",
        birthDate: user.birthDate || "",
        cardIssueDate: user.cardIssueDate || "",
        cardExpiryDate: user.cardExpiryDate || "",
      })
    }
  }, [user, profileForm])

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true)
    try {
      await apiUpdateUser(values as Partial<ApiUser>)
      await refreshUser()
      setIsEditing(false)
      showStatus("success", "Профилот е успешно ажуриран.")
    } catch (err: any) {
      showStatus("error", err.message || "Грешка при ажурирање на профилот.")
    } finally {
      setIsSaving(false)
    }
  }

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 5000)
  }

  const handleCancel = () => {
    profileForm.reset()
    setIsEditing(false)
  }

  const handleDeleteDoc = async (id: number) => {
    setDeletingDocId(id)
    try {
      await apiDeleteUserIdentityDocument(id)
      loadDocuments()
    } finally {
      setDeletingDocId(null)
    }
  }

  const handleAddDoc = async () => {
    setAddError(null)
    setSavingDoc(true)
    try {
      await apiSaveUserIdentityDocument({
        documentType: addForm.documentType,
        documentNumber: addForm.documentNumber || null,
        issueDate: addForm.issueDate || null,
        expiryDate: addForm.expiryDate || null,
      })
      setAddingDoc(false)
      setAddForm({ documentType: "ID_CARD", documentNumber: "", issueDate: "", expiryDate: "" })
      loadDocuments()
    } catch (err: any) {
      setAddError(err.message || "Грешка при зачувување.")
    } finally {
      setSavingDoc(false)
    }
  }

  const handleStartEdit = (doc: UserIdentityDocumentResponse) => {
    setEditingDoc(doc)
    setDocError(null)
    setEditForm({
      documentType: doc.documentType,
      documentNumber: doc.documentNumber ?? "",
      issueDate: doc.issueDate ?? "",
      expiryDate: doc.expiryDate ?? "",
    })
  }

  const handleSaveDoc = async () => {
    if (!editingDoc) return
    setDocError(null)
    setSavingDoc(true)
    try {
      await apiUpdateUserIdentityDocument(editingDoc.id, {
        documentType: editForm.documentType,
        documentNumber: editForm.documentNumber || null,
        issueDate: editForm.issueDate || null,
        expiryDate: editForm.expiryDate || null,
      })
      setEditingDoc(null)
      loadDocuments()
    } catch (err: any) {
      setDocError(err.message || "Грешка при зачувување.")
    } finally {
      setSavingDoc(false)
    }
  }

  const docTypeLabels: Record<string, string> = {
    ID_CARD: "Лична карта",
    PASSPORT: "Пасош",
    DRIVING_LICENSE: "Возачка дозвола",
  }

  if (!user) return null

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Мој Профил</h1>
        <p className="text-muted-foreground">
          Преглед и управување со вашите лични податоци
        </p>
      </div>

      <Separator className="mb-8" />

      {status && (
        <Alert className={`mb-6 ${status.type === "success" ? "border-success/20 bg-success/10 text-success" : "border-destructive/20 bg-destructive/10 text-destructive"}`}>
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          <AlertDescription>
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main profile section */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between px-0 pt-0 gap-4">
                <div>
                  <CardTitle className="text-xl">Лични информации</CardTitle>
                  <CardDescription>Основни податоци за вашиот идентитет</CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => router.push("/citizen/profile/scan-id")}
                  >
                    <Upload className="h-4 w-4" />
                    Личен документ
                  </Button>

                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setIsEditing(true)}
                    >
                      Измени
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="rounded-xl" onClick={handleCancel}>
                        Откажи
                      </Button>

                      <Button type="submit" disabled={isSaving} className="gap-2 rounded-xl">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Зачувај
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-0 space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-sm">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.firstname} {user.lastname}</h2>
                    <p className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">{user.role}</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="text-xs text-muted-foreground uppercase font-bold">Име</Label>
                    <Input id="firstname" readOnly={!isEditing} {...profileForm.register("firstname")} className={`bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    {profileForm.formState.errors.firstname && <p className="text-xs text-destructive">{profileForm.formState.errors.firstname.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-xs text-muted-foreground uppercase font-bold">Презиме</Label>
                    <Input id="lastname" readOnly={!isEditing} {...profileForm.register("lastname")} className={`bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    {profileForm.formState.errors.lastname && <p className="text-xs text-destructive">{profileForm.formState.errors.lastname.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-muted-foreground uppercase font-bold">Е-пошта</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" readOnly value={user.email} className="pl-10 bg-muted/50 opacity-70 cursor-default focus-visible:ring-0" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs text-muted-foreground uppercase font-bold">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" readOnly={!isEditing} {...profileForm.register("phone")} className={`pl-10 bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <CardTitle className="text-lg mb-4">Дополнителни детали</CardTitle>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="embg" className="text-xs text-muted-foreground uppercase font-bold">ЕМБГ</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="embg" readOnly={!isEditing} {...profileForm.register("embg")} className={`pl-10 bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-xs text-muted-foreground uppercase font-bold">Датум на раѓање</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="birthDate" readOnly={!isEditing} type="date" {...profileForm.register("birthDate")} className={`pl-10 bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs text-muted-foreground uppercase font-bold">Пол</Label>
                    <Input id="gender" readOnly={!isEditing} {...profileForm.register("gender")} className={`bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-xs text-muted-foreground uppercase font-bold">Државјанство</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="nationality" readOnly={!isEditing} {...profileForm.register("nationality")} className={`pl-10 bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <CardTitle className="text-lg mb-4">Адреса и локација</CardTitle>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs text-muted-foreground uppercase font-bold">Град</Label>
                    <Input id="city" readOnly={!isEditing} {...profileForm.register("city")} className={`bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs text-muted-foreground uppercase font-bold">Адреса</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="address" readOnly={!isEditing} {...profileForm.register("address")} className={`pl-10 bg-background/50 transition-all ${!isEditing ? "opacity-70 cursor-default focus-visible:ring-0" : ""}`} />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg">Зачувани документи</CardTitle>
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setAddingDoc(true); setAddError(null) }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {addingDoc && (
                  <div className="mb-4 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-bold">Тип на документ</Label>
                      <select
                        value={addForm.documentType}
                        onChange={(e) => setAddForm((f) => ({ ...f, documentType: e.target.value as DocumentType }))}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                      >
                        <option value="ID_CARD">Лична карта</option>
                        <option value="PASSPORT">Пасош</option>
                        <option value="DRIVING_LICENSE">Возачка дозвола</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase font-bold">Број на документ</Label>
                      <Input value={addForm.documentNumber} onChange={(e) => setAddForm((f) => ({ ...f, documentNumber: e.target.value }))} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase font-bold">Датум на издавање</Label>
                        <Input type="date" value={addForm.issueDate} onChange={(e) => setAddForm((f) => ({ ...f, issueDate: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase font-bold">Датум на истекување</Label>
                        <Input type="date" value={addForm.expiryDate} onChange={(e) => setAddForm((f) => ({ ...f, expiryDate: e.target.value }))} />
                      </div>
                    </div>
                    {addError && <p className="text-xs text-destructive">{addError}</p>}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setAddingDoc(false)}>Откажи</Button>
                      <Button type="button" size="sm" disabled={savingDoc} onClick={handleAddDoc} className="gap-2">
                        {savingDoc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Зачувај
                      </Button>
                    </div>
                  </div>
                )}

                {savedDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нема зачувани документи.</p>
                ) : (
                  <div className="space-y-3">
                    {savedDocs.map((doc) => (
                      <div key={doc.id} className="rounded-xl border border-border bg-background/50">
                        {editingDoc?.id === doc.id ? (
                          <div className="space-y-3 p-4">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground uppercase font-bold">Тип на документ</Label>
                              <select
                                value={editForm.documentType}
                                onChange={(e) => setEditForm((f) => ({ ...f, documentType: e.target.value as DocumentType }))}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                              >
                                <option value="ID_CARD">Лична карта</option>
                                <option value="PASSPORT">Пасош</option>
                                <option value="DRIVING_LICENSE">Возачка дозвола</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground uppercase font-bold">Број на документ</Label>
                              <Input value={editForm.documentNumber} onChange={(e) => setEditForm((f) => ({ ...f, documentNumber: e.target.value }))} />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Датум на издавање</Label>
                                <Input type="date" value={editForm.issueDate} onChange={(e) => setEditForm((f) => ({ ...f, issueDate: e.target.value }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Датум на истекување</Label>
                                <Input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm((f) => ({ ...f, expiryDate: e.target.value }))} />
                              </div>
                            </div>
                            {docError && <p className="text-xs text-destructive">{docError}</p>}
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => setEditingDoc(null)}>Откажи</Button>
                              <Button type="button" size="sm" disabled={savingDoc} onClick={handleSaveDoc} className="gap-2">
                                {savingDoc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                Зачувај
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{docTypeLabels[doc.documentType]}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.documentNumber && `Бр. ${doc.documentNumber}`}
                                  {doc.expiryDate && ` · Важи до ${doc.expiryDate}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(doc)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteDoc(doc.id)}
                                disabled={deletingDocId === doc.id}
                              >
                                {deletingDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-6">
          <Card className="border border-border/50 bg-muted/30 shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border/50">
              <CardTitle className="text-base">Поставки за сметка</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/citizen/profile/change-email")}
                  className="w-full rounded-xl gap-2 justify-start bg-background hover:bg-muted"
                >
                  <Mail className="h-4 w-4" />
                  Промени е-пошта
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/citizen/profile/change-password")}
                  className="w-full rounded-xl gap-2 justify-start bg-background hover:bg-muted"
                >
                  <Shield className="h-4 w-4" />
                  Промени лозинка
                </Button>

                <Separator className="my-2" />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Одјави се
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-primary/5 shadow-none rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-sm mb-1">Безбедност на податоци</h3>
              <p className="text-xs text-muted-foreground">Вашите податоци се заштитени и се користат само за државни услуги.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

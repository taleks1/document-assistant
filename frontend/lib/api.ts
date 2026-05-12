const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string
  role: "ADMIN" | "CITIZEN"
}

export interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  role: "ADMIN" | "CITIZEN"
  dateCreated: string | null
  embg: string | null
  gender: string | null
  nationality: string | null
  phone: string | null
  city: string | null
  address: string | null
  cardId: string | null
  birthDate: string | null
  cardIssueDate: string | null
  cardExpiryDate: string | null
  active: boolean
}

export type DocumentRequestStatus = "SUBMITTED" | "IN_REVIEW" | "REVIEWED" | "APPROVED" | "REJECTED"
export const DocumentRequestStatusLabel: Record<DocumentRequestStatus, string> = {
  SUBMITTED: "Поднесено",
  IN_REVIEW: "Во обработка",
  REVIEWED: "Разгледано",
  APPROVED: "Одобрено",
  REJECTED: "Одбиено",
}

export type DocumentRequestType =
  | "REQUEST"
  | "PERMIT"
  | "COMPLAINT"
  | "APPLICATION"
  | "CERTIFICATE"
  | "OBJECTION"
  | "STATEMENT"
  | "REPORT"
  | "OTHER"
export const DocumentRequestTypeLabel: Record<DocumentRequestType, string> = {
  REQUEST: "Барање",
  PERMIT: "Дозвола",
  COMPLAINT: "Жалба",
  APPLICATION: "Апликација",
  CERTIFICATE: "Потврда",
  OBJECTION: "Приговор",
  STATEMENT: "Изјава",
  REPORT: "Извештај",
  OTHER: "Друго",
}

export interface DocumentRequestResponse {
  id: number
  referenceNumber: string
  type: string
  title: string
  description: string
  status: string
}

export interface StatusHistoryResponse {
  status: DocumentRequestStatus
  timestamp: string
  note: string | null
}

export interface DocumentRequestFullResponse {
  id: number
  referenceNumber: string
  userId: number
  userFullName: string
  userEmail: string
  type: DocumentRequestType
  title: string
  description: string | null
  notes: string | null
  status: DocumentRequestStatus
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  statusHistory: StatusHistoryResponse[]
}

export interface RejectRequest {
  reason: string
}

export interface UpdateStatusRequest {
  status: DocumentRequestStatus
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      message = body?.message ?? body?.error ?? message
    } catch {
      // ignore – keep the status-text message
    }
    throw new Error(message)
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return {} as T
  }

  try {
    return await res.json() as T
  } catch {
    return {} as T
  }
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function apiRegister(
  firstname: string,
  lastname: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstname, lastname, email, password }),
  })
  return handleResponse<AuthResponse>(res)
}

export async function apiAuthenticate(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<AuthResponse>(res)
}

// ─── User endpoints ───────────────────────────────────────────────────────────

export async function apiGetCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    method: "GET",
    headers: authHeaders(),
  })
  return handleResponse<User>(res)
}

export async function apiUpdateUser(data: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<User>(res)
}

export async function apiChangeEmail(email: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/users/change-email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  })
  return handleResponse<AuthResponse>(res)
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  return handleResponse<void>(res)
}

// ─── Admin user endpoints ─────────────────────────────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export async function apiGetAdminUsers(
  page: number,
  size: number
): Promise<Page<User>> {
  const res = await fetch(
    `${BASE_URL}/api/admin/users?page=${page}&size=${size}`,
    { method: "GET", headers: authHeaders() }
  )
  return handleResponse<Page<User>>(res)
}

export async function apiGetAdminUserById(id: number | string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: "GET",
    headers: authHeaders(),
  })
  return handleResponse<User>(res)
}

export async function apiGetAdminUserRequests(
  userId: number,
  page: number,
  size: number
): Promise<Page<DocumentRequestFullResponse>> {
  const res = await fetch(
    `${BASE_URL}/api/admin/users/${userId}/requests?page=${page}&size=${size}`,
    { method: "GET", headers: authHeaders() }
  )
  return handleResponse<Page<DocumentRequestFullResponse>>(res)
}

// ─── OCR endpoints ────────────────────────────────────────────────────────────

export interface OcrResponse {
  rawText: string
  parsed: {
    fields_en: Record<string, string>
    fields_mk: Record<string, string>
  }
}

export async function apiOcrUpload(files: File[]): Promise<OcrResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  const token = getToken()
  const res = await fetch(`${BASE_URL}/api/ocr/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  return handleResponse<OcrResponse>(res)
}

// ─── Document request endpoints ───────────────────────────────────────────────

export interface CreateRequestPayload {
  type: string
  title: string
  description: string
  notes: string | null
}

export async function apiCreateRequest(
  payload: CreateRequestPayload
): Promise<DocumentRequestResponse> {
  const res = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<DocumentRequestResponse>(res)
}

export async function apiGetRequestById(id: number): Promise<DocumentRequestFullResponse> {
  const res = await fetch(`${BASE_URL}/api/requests/${id}`, {
    method: "GET",
    headers: authHeaders(),
  })
  return handleResponse<DocumentRequestFullResponse>(res)
}

export async function apiGetRequestsForUser(
  userId: number,
  page: number,
  size: number
): Promise<Page<DocumentRequestFullResponse>> {
  const res = await fetch(
    `${BASE_URL}/api/requests/user/${userId}?page=${page}&size=${size}`,
    { method: "GET", headers: authHeaders() }
  )
  return handleResponse<Page<DocumentRequestFullResponse>>(res)
}

// ─── Admin request endpoints ──────────────────────────────────────────────────

export async function apiAdminGetAllRequests(
  page: number,
  size: number
): Promise<Page<DocumentRequestFullResponse>> {
  const res = await fetch(
    `${BASE_URL}/api/admin/requests?page=${page}&size=${size}`,
    { method: "GET", headers: authHeaders() }
  )
  return handleResponse<Page<DocumentRequestFullResponse>>(res)
}

export async function apiAdminGetRequestById(id: number): Promise<DocumentRequestFullResponse> {
  const res = await fetch(`${BASE_URL}/api/admin/requests/${id}`, {
    method: "GET",
    headers: authHeaders(),
  })
  return handleResponse<DocumentRequestFullResponse>(res)
}

export async function apiAdminAcceptRequest(id: number): Promise<DocumentRequestFullResponse> {
  const res = await fetch(`${BASE_URL}/api/admin/requests/${id}/accept`, {
    method: "PUT",
    headers: authHeaders(),
  })
  return handleResponse<DocumentRequestFullResponse>(res)
}

export async function apiAdminRejectRequest(id: number, reason: string): Promise<DocumentRequestFullResponse> {
  const res = await fetch(`${BASE_URL}/api/admin/requests/${id}/reject`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  })
  return handleResponse<DocumentRequestFullResponse>(res)
}

export async function apiAdminUpdateRequestStatus(id: number, status: DocumentRequestStatus): Promise<DocumentRequestFullResponse> {
  const res = await fetch(`${BASE_URL}/api/admin/requests/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  return handleResponse<DocumentRequestFullResponse>(res)
}

// ─── User identity document endpoints ────────────────────────────────────────

export type DocumentType = "ID_CARD" | "PASSPORT" | "DRIVING_LICENSE"

export interface UserIdentityDocumentResponse {
  id: number
  documentType: DocumentType
  documentNumber: string | null
  issueDate: string | null
  expiryDate: string | null
  createdAt: string
}

export interface SaveUserIdentityDocumentRequest {
  documentType: DocumentType
  documentNumber: string | null
  issueDate: string | null
  expiryDate: string | null
}

export async function apiGetUserIdentityDocuments(): Promise<UserIdentityDocumentResponse[]> {
  const res = await fetch(`${BASE_URL}/api/users/me/documents`, {
    method: "GET",
    headers: authHeaders(),
  })
  return handleResponse<UserIdentityDocumentResponse[]>(res)
}

export async function apiSaveUserIdentityDocument(data: SaveUserIdentityDocumentRequest): Promise<UserIdentityDocumentResponse> {
  const res = await fetch(`${BASE_URL}/api/users/me/documents`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<UserIdentityDocumentResponse>(res)
}

export async function apiUpdateUserIdentityDocument(id: number, data: SaveUserIdentityDocumentRequest): Promise<UserIdentityDocumentResponse> {
  const res = await fetch(`${BASE_URL}/api/users/me/documents/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<UserIdentityDocumentResponse>(res)
}

export async function apiDeleteUserIdentityDocument(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/me/documents/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse<void>(res)
}

export async function apiUploadRequestFiles(
  requestId: number,
  files: File[]
): Promise<void> {
  const formData = new FormData()
  files.forEach((f) => formData.append("files", f))
  const token = getToken()
  const res = await fetch(`${BASE_URL}/api/requests/${requestId}/files`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  return handleResponse<void>(res)
}
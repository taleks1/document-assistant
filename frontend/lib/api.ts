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

// ─── Admin user list ──────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number   // current page (0-indexed)
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
  notes?: string | null
}

export interface DocumentRequestResponse {
  id: number
  referenceNumber: string
  type: string
  title: string
  description: string
  status: string
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

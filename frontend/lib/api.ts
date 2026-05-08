const BASE_URL = "http://localhost:8080"

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
  return res.json() as Promise<T>
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

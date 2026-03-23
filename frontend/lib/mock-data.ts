export type RequestStatus = "sent" | "processing" | "reviewed" | "approved" | "rejected"
export const statusLabels: Record<RequestStatus, string> = {
  sent: "Поднесено",
  processing: "Во обработка",
  reviewed: "Разгледано",
  approved: "Одобрено",
  rejected: "Одбиено",
}
export const userStatusLabels: Record<string, string> = {
  active: "Активен",
  inactive: "Неактивен",
}

export const userRoleLabels: Record<string, string> = {
  citizen: "Корисник",
  admin: "Администратор",
}

export function getUserStatusLabel(status: string) {
  return userStatusLabels[status] || status
}

export function getUserRoleLabel(role: string) {
  return userRoleLabels[role] || role
}

export function getStatusLabel(status: RequestStatus): string {
  return statusLabels[status] || status
}
export type RequestType =
  | "request"
  | "permit"
  | "complaint"
  | "application"
  | "certificate"
  | "objection"
  | "statement"
  | "report"
  | "other"
  export const requestTypeLabels: Record<RequestType, string> = {
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

export function getRequestTypeLabel(type: RequestType) {
  return requestTypeLabels[type] || type
}

export interface Request {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: RequestType
  title: string
  description: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  extractedData: {
    firstName: string
    lastName: string
    idNumber: string
    embg: string
    address: string
    dateOfBirth: string
    documentExpiryDate: string
  }
  attachments: string[]
  notes?: string
  rejectionReason?: string
  statusHistory: {
    status: RequestStatus
    timestamp: string
    note?: string
  }[]
}

export interface Document {
  id: string
  requestId: string
  name: string
  type: "generated" | "uploaded" | "final"
  createdAt: string
  url: string
}

export interface UserStats {
  total: number
  processing: number
  approved: number
  rejected: number
}

export interface AdminStats {
  total: number
  newToday: number
  processing: number
  approved: number
  rejected: number
}

export const mockRequests: Request[] = [
  {
    id: "REQ-2024-001",
    userId: "1",
    userName: "John Citizen",
    userEmail: "citizen@example.com",
    type: "permit",
    title: "Building Permit Application",
    description: "Application for residential building permit for property renovation.",
    status: "processing",
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-18T14:20:00Z",
    extractedData: {
      firstName: "John",
      lastName: "Citizen",
      idNumber: "ID-123456789",
      embg: "1506985123456",
      address: "123 Main Street, Capital City, 10001",
      dateOfBirth: "1985-06-15",
      documentExpiryDate: "2030-06-15",
    },
    attachments: ["id_card.pdf", "property_deed.pdf"],
    notes: "Urgent processing requested",
    statusHistory: [
      { status: "sent", timestamp: "2024-03-15T10:30:00Z" },
      { status: "processing", timestamp: "2024-03-16T09:00:00Z", note: "Assigned to reviewer" },
    ],
  },
  {
    id: "REQ-2024-002",
    userId: "1",
    userName: "John Citizen",
    userEmail: "citizen@example.com",
    type: "certificate",
    title: "Birth Certificate Copy",
    description: "Request for certified copy of birth certificate.",
    status: "approved",
    createdAt: "2024-03-10T08:15:00Z",
    updatedAt: "2024-03-14T11:45:00Z",
    extractedData: {
      firstName: "John",
      lastName: "Citizen",
      idNumber: "ID-123456789",
      embg: "1506985123456",
      address: "123 Main Street, Capital City, 10001",
      dateOfBirth: "1985-06-15",
      documentExpiryDate: "2030-06-15",
    },
    attachments: ["id_card.pdf"],
    statusHistory: [
      { status: "sent", timestamp: "2024-03-10T08:15:00Z" },
      { status: "processing", timestamp: "2024-03-11T09:00:00Z" },
      { status: "reviewed", timestamp: "2024-03-13T14:30:00Z" },
      { status: "approved", timestamp: "2024-03-14T11:45:00Z", note: "Certificate issued" },
    ],
  },
  {
    id: "REQ-2024-003",
    userId: "1",
    userName: "John Citizen",
    userEmail: "citizen@example.com",
    type: "request",
    title: "Noise Complaint",
    description: "Formal complaint regarding excessive noise from nearby construction site.",
    status: "approved",
    createdAt: "2024-03-08T16:00:00Z",
    updatedAt: "2024-03-12T10:30:00Z",
    extractedData: {
      firstName: "John",
      lastName: "Citizen",
      idNumber: "ID-123456789",
      embg: "1506985123456",
      address: "123 Main Street, Capital City, 10001",
      dateOfBirth: "1985-06-15",
      documentExpiryDate: "2030-06-15",
    },
    attachments: ["id_card.pdf", "evidence_photos.zip"],
    rejectionReason:
      "Construction site has valid permit for daytime operations. Noise levels within legal limits.",
    statusHistory: [
      { status: "sent", timestamp: "2024-03-08T16:00:00Z" },
      { status: "processing", timestamp: "2024-03-09T09:00:00Z" },
      { status: "reviewed", timestamp: "2024-03-11T15:00:00Z" },
      { status: "rejected", timestamp: "2024-03-12T10:30:00Z", note: "Construction within legal parameters" },
    ],
  },
  {
    id: "REQ-2024-004",
    userId: "1",
    userName: "John Citizen",
    userEmail: "citizen@example.com",
    type: "application",
    title: "Parking Permit Renewal",
    description: "Annual renewal of residential parking permit.",
    status: "sent",
    createdAt: "2024-03-19T09:00:00Z",
    updatedAt: "2024-03-19T09:00:00Z",
    extractedData: {
      firstName: "John",
      lastName: "Citizen",
      idNumber: "ID-123456789",
      embg: "1506985123456",
      address: "123 Main Street, Capital City, 10001",
      dateOfBirth: "1985-06-15",
      documentExpiryDate: "2030-06-15",
    },
    attachments: ["id_card.pdf", "vehicle_registration.pdf"],
    statusHistory: [{ status: "sent", timestamp: "2024-03-19T09:00:00Z" }],
  },
  {
    id: "REQ-2024-005",
    userId: "3",
    userName: "Jane Smith",
    userEmail: "jane.smith@email.com",
    type: "permit",
    title: "Business License Application",
    description: "New business license application for retail store.",
    status: "reviewed",
    createdAt: "2024-03-14T11:00:00Z",
    updatedAt: "2024-03-18T16:30:00Z",
    extractedData: {
      firstName: "Jane",
      lastName: "Smith",
      idNumber: "ID-987654321",
      embg: "2203990123456",
      address: "456 Commerce Ave, Capital City, 10002",
      dateOfBirth: "1990-03-22",
      documentExpiryDate: "2029-03-22",
    },
    attachments: ["id_card.pdf", "business_plan.pdf", "lease_agreement.pdf"],
    statusHistory: [
      { status: "sent", timestamp: "2024-03-14T11:00:00Z" },
      { status: "processing", timestamp: "2024-03-15T10:00:00Z" },
      { status: "reviewed", timestamp: "2024-03-18T16:30:00Z", note: "Pending final approval" },
    ],
  },
]

export const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    requestId: "REQ-2024-001",
    name: "Building Permit Application Form",
    type: "generated",
    createdAt: "2024-03-15T10:30:00Z",
    url: "/documents/building-permit-application.pdf",
  },
  {
    id: "DOC-002",
    requestId: "REQ-2024-002",
    name: "Birth Certificate Request Form",
    type: "generated",
    createdAt: "2024-03-10T08:15:00Z",
    url: "/documents/birth-cert-request.pdf",
  },
  {
    id: "DOC-003",
    requestId: "REQ-2024-002",
    name: "Certified Birth Certificate",
    type: "final",
    createdAt: "2024-03-14T11:45:00Z",
    url: "/documents/birth-certificate-final.pdf",
  },
]

export const mockUsers = [
  {
    id: "1",
    name: "John Citizen",
    email: "citizen@example.com",
    role: "citizen",
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    requestCount: 4,
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    role: "citizen",
    status: "active",
    createdAt: "2024-02-20T00:00:00Z",
    requestCount: 1,
  },
  {
    id: "4",
    name: "Robert Johnson",
    email: "r.johnson@email.com",
    role: "citizen",
    status: "active",
    createdAt: "2024-03-01T00:00:00Z",
    requestCount: 2,
  },
  {
    id: "5",
    name: "Maria Garcia",
    email: "m.garcia@email.com",
    role: "citizen",
    status: "inactive",
    createdAt: "2024-01-05T00:00:00Z",
    requestCount: 0,
  },
]

export function getCitizenStats(userId: string): UserStats {
  const userRequests = mockRequests.filter((r) => r.userId === userId)
  return {
    total: userRequests.length,
    processing: userRequests.filter((r) => r.status === "processing" || r.status === "sent").length,
    approved: userRequests.filter((r) => r.status === "approved").length,
    rejected: userRequests.filter((r) => r.status === "rejected").length,
  }
}

export function getAdminStats(): AdminStats {
  const today = new Date().toISOString().split("T")[0]
  return {
    total: mockRequests.length,
    newToday: mockRequests.filter((r) => r.createdAt.startsWith(today)).length || 2,
    processing: mockRequests.filter((r) => r.status === "processing" || r.status === "sent").length,
    approved: mockRequests.filter((r) => r.status === "approved").length,
    rejected: mockRequests.filter((r) => r.status === "rejected").length,
  }
}

export function getRequestsByType(): { type: string; count: number }[] {
  const counts: Record<string, number> = {}
  mockRequests.forEach((r) => {
    counts[r.type] = (counts[r.type] || 0) + 1
  })
  return Object.entries(counts).map(([type, count]) => ({ type, count }))
}

export function getRequestsByStatus(): { status: string; count: number }[] {
  const counts: Record<string, number> = {}
  mockRequests.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1
  })
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}

export function getMonthlyActivity(): { month: string; requests: number }[] {
  return [
    { month: "Јануари", requests: 12 },
    { month: "Февруари", requests: 18 },
    { month: "Март", requests: 25 },
    { month: "Април", requests: 15 },
    { month: "Мај", requests: 22 },
    { month: "Јуни", requests: 28 },
  ]
}
// mock-data.ts
export const weeklyData = [
  { day: "ПОНЕДЕЛНИК", requests: 12 },
  { day: "ВТОРНИК", requests: 18 },
  { day: "СРЕДА", requests: 15 },
  { day: "ЧЕТВРТОК", requests: 22 },
  { day: "ПЕТОК", requests: 28 },
  { day: "САБОТА", requests: 8 },
  { day: "НЕДЕЛА", requests: 5 },
]
export const REQUESTS_STORAGE_KEY = "admin-requests"
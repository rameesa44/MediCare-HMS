export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber?: string
  profileImageUrl?: string
  role: number
  roleName: "Admin" | "Doctor" | "Receptionist" | "WardStaff" | "Patient"
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
  statusCode: number
}

export interface PaginatedList<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

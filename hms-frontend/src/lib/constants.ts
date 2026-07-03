export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5278/api/v1"

export const USER_ROLES = {
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  WARD_STAFF: "WardStaff",
  PATIENT: "Patient",
} as const

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES]

export const DASHBOARD_ROUTES = {
  Admin: "/admin",
  Doctor: "/doctor",
  Receptionist: "/receptionist",
  WardStaff: "/ward-staff",
  Patient: "/patient-portal",
} as const

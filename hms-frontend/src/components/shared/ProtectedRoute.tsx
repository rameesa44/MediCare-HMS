import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { UserRoleType } from "@/lib/constants"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRoleType[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.roleName as UserRoleType)) {
    // Redirect to the user's own dashboard if they try to access a forbidden area
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

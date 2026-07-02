import React, { createContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  updateProfile: (updatedUser: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore auth state on mount
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("accessToken")

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // Clear corrupt state
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      }
    }
    setLoading(false)
  }, [])

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
  }

  const updateProfile = (updatedFields: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields }
      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

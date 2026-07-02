import React, { useState } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if user session is missing
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar className="hidden lg:flex shrink-0" />

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar content drawer */}
          <Sidebar className="fixed top-0 bottom-0 left-0 w-64 z-50 animate-slide-in" />
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header navbar */}
        <Header onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Scrollable View Content slot */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

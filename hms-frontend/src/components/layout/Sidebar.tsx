import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { DASHBOARD_ROUTES } from "@/lib/constants"
import {
  LayoutDashboard,
  Users,
  Activity,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Hospital,
  BedDouble,
  UserCheck
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const location = useLocation()
  const { user, logout } = useAuth()

  if (!user) return null

  // Get navigation links based on user role
  const getNavLinks = () => {
    const common = [{ to: "/", label: "Hospital Website", icon: Hospital }]

    switch (user.roleName) {
      case "Admin":
        return [
          { to: DASHBOARD_ROUTES.Admin, label: "Dashboard", icon: LayoutDashboard },
          { to: `${DASHBOARD_ROUTES.Admin}/departments`, label: "Departments", icon: Hospital },
          { to: `${DASHBOARD_ROUTES.Admin}/doctors`, label: "Doctors", icon: UserCheck },
          { to: `${DASHBOARD_ROUTES.Admin}/staff`, label: "Staff Management", icon: Users },
          { to: `${DASHBOARD_ROUTES.Admin}/patients`, label: "Patients", icon: Users },
          { to: `${DASHBOARD_ROUTES.Admin}/appointments`, label: "Appointments", icon: Calendar },
          { to: `${DASHBOARD_ROUTES.Admin}/wards`, label: "Wards & Beds", icon: BedDouble },
          { to: `${DASHBOARD_ROUTES.Admin}/billing`, label: "Billing", icon: CreditCard },
          { to: `${DASHBOARD_ROUTES.Admin}/audit-logs`, label: "Audit Logs", icon: ShieldAlert },
          { to: `${DASHBOARD_ROUTES.Admin}/settings`, label: "Settings", icon: Settings },
          ...common,
        ]
      case "Doctor":
        return [
          { to: DASHBOARD_ROUTES.Doctor, label: "Dashboard", icon: LayoutDashboard },
          { to: `${DASHBOARD_ROUTES.Doctor}/appointments`, label: "Appointments", icon: Calendar },
          { to: `${DASHBOARD_ROUTES.Doctor}/patients`, label: "My Patients", icon: Users },
          { to: `${DASHBOARD_ROUTES.Doctor}/schedule`, label: "Schedule", icon: Settings },
          ...common,
        ]
      case "Receptionist":
        return [
          { to: DASHBOARD_ROUTES.Receptionist, label: "Dashboard", icon: LayoutDashboard },
          { to: `${DASHBOARD_ROUTES.Receptionist}/register`, label: "Register Patient", icon: UserCheck },
          { to: `${DASHBOARD_ROUTES.Receptionist}/appointments`, label: "Bookings", icon: Calendar },
          { to: `${DASHBOARD_ROUTES.Receptionist}/queue`, label: "Queue Token", icon: Activity },
          { to: `${DASHBOARD_ROUTES.Receptionist}/billing`, label: "Billing", icon: CreditCard },
          ...common,
        ]
      case "WardStaff":
        return [
          { to: DASHBOARD_ROUTES.WardStaff, label: "Dashboard", icon: LayoutDashboard },
          { to: `${DASHBOARD_ROUTES.WardStaff}/admissions`, label: "Admissions", icon: BedDouble },
          ...common,
        ]
      case "Patient":
        return [
          { to: DASHBOARD_ROUTES.Patient, label: "My Portal", icon: LayoutDashboard },
          { to: `${DASHBOARD_ROUTES.Patient}/appointments`, label: "Book Appointment", icon: Calendar },
          { to: `${DASHBOARD_ROUTES.Patient}/history`, label: "Medical History", icon: FileText },
          { to: `${DASHBOARD_ROUTES.Patient}/bills`, label: "My Bills", icon: CreditCard },
          ...common,
        ]
      default:
        return common
    }
  }

  const navLinks = getNavLinks()

  return (
    <aside className={`w-64 bg-card border-r border-border h-screen flex flex-col ${className}`}>
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          M
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">MediCare HMS</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Session profile details */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.roleName}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

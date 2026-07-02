import React, { useState, useEffect } from "react"
import { Bell, Sun, Moon, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface HeaderProps {
  onMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "dark-light") // Simple Light theme override
    }
  }, [darkMode])

  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Mobile nav toggler */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-muted-foreground hover:bg-secondary lg:hidden transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Greeting info */}
      <div className="hidden sm:block">
        <h1 className="text-lg font-bold text-foreground m-0 p-0 leading-tight">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-xs text-muted-foreground m-0">
          MediCare Hospital Administration System v1.0
        </p>
      </div>

      {/* Utility Actions */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
          </button>
        </div>

        {/* User initials badge */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </div>
      </div>
    </header>
  )
}

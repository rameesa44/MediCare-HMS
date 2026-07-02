import React from "react"
import { Link } from "react-router-dom"
import { ShieldCheck, Heart, User } from "lucide-react"

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">MediCare Hospital</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shadow-primary/10"
            >
              <User className="w-4 h-4" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Enterprise Level Medical Portal
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Modern AI-Ready <span className="text-primary">Hospital Management</span> Platform
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          MediCare connects doctors, receptionists, patients, and ward staff inside a unified, offline-capable interface designed to speed up operations and improve clinical workflows.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
          >
            Access Dashboard
          </Link>
          <a
            href="#details"
            className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} MediCare HMS. All rights reserved.</p>
      </footer>
    </div>
  )
}

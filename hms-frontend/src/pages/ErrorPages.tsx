import React from "react"
import { Link } from "react-router-dom"

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 gap-4">
    <div className="text-8xl font-extrabold text-primary/30">404</div>
    <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
    <p className="text-muted-foreground max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
    >
      Return to Home
    </Link>
  </div>
)

export const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 gap-4">
    <div className="text-8xl font-extrabold text-destructive/30">403</div>
    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
    <p className="text-muted-foreground max-w-sm">
      You don't have permission to access this page.
    </p>
    <Link
      to="/"
      className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
    >
      Return to Home
    </Link>
  </div>
)

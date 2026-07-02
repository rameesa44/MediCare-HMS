import React, { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/10":
            variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          "border border-input bg-background hover:bg-secondary hover:text-foreground":
            variant === "outline",
          "text-muted-foreground hover:bg-secondary hover:text-foreground":
            variant === "ghost",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90":
            variant === "destructive",
        },
        {
          "h-9 px-3 text-sm": size === "sm",
          "h-11 px-4 py-2 text-base": size === "md",
          "h-13 px-6 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

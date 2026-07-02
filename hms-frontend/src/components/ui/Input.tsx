import React, { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-foreground/80 leading-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-destructive leading-tight">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted-foreground leading-tight">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

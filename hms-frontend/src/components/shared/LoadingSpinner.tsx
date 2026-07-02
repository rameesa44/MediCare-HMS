import React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  label?: string
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label = "Loading...",
  fullScreen = false,
}) => {
  const spinnerElement = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`border-4 border-primary border-t-transparent rounded-full animate-spin ${
          size === "sm" ? "w-6 h-6 border-2" : size === "lg" ? "w-12 h-12 border-4" : "w-8 h-8 border-3"
        }`}
      />
      {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        {spinnerElement}
      </div>
    )
  }

  return <div className="flex items-center justify-center p-8">{spinnerElement}</div>
}

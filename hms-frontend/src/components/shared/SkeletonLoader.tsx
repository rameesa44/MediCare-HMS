import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular"
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted-foreground/15",
        {
          "h-4 w-full rounded": variant === "text",
          "rounded-lg": variant === "rectangular",
          "rounded-full": variant === "circular",
        },
        className
      )}
      {...props}
    />
  )
}

export const SkeletonCardList: React.FC = () => {
  return (
    <div className="space-y-4 w-full">
      <Skeleton variant="rectangular" className="h-24 w-full" />
      <Skeleton variant="rectangular" className="h-24 w-full" />
      <Skeleton variant="rectangular" className="h-24 w-full" />
    </div>
  )
}

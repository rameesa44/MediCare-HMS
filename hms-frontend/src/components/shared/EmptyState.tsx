import React from "react"
import { LucideIcon, Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onActionClick?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-muted/5 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shadow-primary/10 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

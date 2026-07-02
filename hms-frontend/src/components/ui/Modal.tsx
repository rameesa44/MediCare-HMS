import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop backdrop-blur overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card container */}
      <div
        ref={modalRef}
        className={cn(
          "w-full bg-card rounded-xl border border-border shadow-xl relative z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200",
          {
            "max-w-md": size === "sm",
            "max-w-lg": size === "md",
            "max-w-2xl": size === "lg",
            "max-w-4xl": size === "xl",
          }
        )}
      >
        {/* Header section */}
        <div className="flex items-start justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight m-0">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

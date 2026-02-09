import { cn } from "@/lib/utils"

interface ContentContainerProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean  // Skip horizontal padding
  fullWidth?: boolean  // Bypass max-width constraint
}

export function ContentContainer({
  children,
  className,
  noPadding = false,
  fullWidth = false
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto",
        !fullWidth && "max-w-content",
        !noPadding && "px-[var(--content-padding-x)]",
        className
      )}
    >
      {children}
    </div>
  )
}

import type { ReactNode } from "react"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  toggleId?: string
  onToggle?: (state: boolean) => void
  toggleState?: boolean
  onClick?: () => void
  variant?: "default" | "destructive"
  showChevron?: boolean
  badge?: number | string
  className?: string
}

export function MenuItem({
  icon,
  title,
  description,
  toggleId,
  onToggle,
  toggleState,
  onClick,
  variant = "default",
  showChevron = false,
  badge,
  className
}: Props) {
  const [isToggled, setIsToggled] = useState(toggleState)

  function handleToggle(checked: boolean) {
    setIsToggled(checked)
    onToggle?.(checked)
  }

  const isDestructive = variant === "destructive"

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 transition-colors relative group",
        onClick && "cursor-pointer hover:bg-muted/50 active:bg-muted",
        className
      )}
      onClick={toggleId ? undefined : onClick}
    >
      {/* Icon Area */}
      {icon && (
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          isDestructive
            ? "bg-red-100/50 text-red-600"
            : "bg-primary/5 text-primary"
        )}>
          {icon}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <span className={cn(
          "text-sm font-medium leading-none mb-1",
          isDestructive ? "text-red-600" : "text-foreground"
        )}>
          {title}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground truncate">
            {description}
          </span>
        )}
      </div>

      {/* Action Area (Right Side) */}
      <div className="flex items-center gap-3">
        {badge && (
          <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {badge}
          </span>
        )}

        {toggleId && (
          <Switch
            id={toggleId}
            checked={isToggled}
            onCheckedChange={handleToggle}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {showChevron && !toggleId && (
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
    </div>
  )
}


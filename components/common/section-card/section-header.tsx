"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  iconColorClassName: string;
  title: string;
  badge?: string;
  onEdit?: () => void;
  editLabel?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  iconColorClassName,
  title,
  badge,
  onEdit,
  editLabel = "Edit",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-1", className)}>
      <div className="flex items-center space-x-2">
        <div className={cn("p-1 rounded-md", iconColorClassName)}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <h3 className="font-bold text-base text-foreground">{title}</h3>
      </div>

      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors min-h-touch min-w-touch inline-flex items-center justify-center rounded hover:bg-muted"
          >
            {editLabel}
          </button>
        )}
      </div>
    </div>
  );
}

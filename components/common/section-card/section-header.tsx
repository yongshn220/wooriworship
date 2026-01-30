"use client";

import { LucideIcon, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  icon: LucideIcon;
  iconColorClassName: string;
  title: string;
  badge?: string;
  onEdit?: () => void;
  editLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  iconColorClassName,
  title,
  badge,
  onEdit,
  editLabel = "Edit",
  onDelete,
  deleteLabel = "Delete",
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
        {onEdit && !onDelete && (
          <button
            onClick={onEdit}
            className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors min-h-touch min-w-touch inline-flex items-center justify-center rounded hover:bg-muted"
          >
            {editLabel}
          </button>
        )}
        {onEdit && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid="section-menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <button
                onClick={onEdit}
                data-testid="section-edit"
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted rounded-sm transition-colors"
              >
                <SquarePen className="mr-2 w-4 h-4" />
                {editLabel}
              </button>
              <button
                onClick={onDelete}
                data-testid="section-delete"
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
              >
                <Trash2 className="mr-2 w-4 h-4" />
                {deleteLabel}
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

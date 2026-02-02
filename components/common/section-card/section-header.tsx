"use client";

import { useState } from "react";
import { LucideIcon, Menu, SquarePen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ActionBottomSheet,
  ActionBottomSheetAction,
} from "@/components/common/action-bottom-sheet";

interface SectionHeaderProps {
  icon: LucideIcon;
  iconColorClassName: string;
  title: string;
  badge?: string;
  onEdit?: () => void;
  editLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  actions?: ActionBottomSheetAction[];
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
  actions,
  className,
}: SectionHeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Build actions array from onEdit/onDelete if custom actions not provided
  const sheetActions: ActionBottomSheetAction[] = actions || [
    ...(onEdit
      ? [
          {
            label: editLabel,
            icon: SquarePen,
            onClick: onEdit,
            variant: "default" as const,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: deleteLabel,
            icon: Trash2,
            onClick: onDelete,
            variant: "destructive" as const,
          },
        ]
      : []),
  ];

  const showMoreButton = (onEdit && onDelete) || (actions && actions.length > 0);

  return (
    <>
      <div className={cn("flex items-center justify-between px-3 pt-3 pb-1", className)}>
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
          {onEdit && !showMoreButton && (
            <button
              onClick={onEdit}
              className="text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted"
            >
              {editLabel}
            </button>
          )}
          {showMoreButton && (
            <button
              onClick={() => setSheetOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted"
              data-testid="section-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <ActionBottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={title}
        actions={sheetActions}
      />
    </>
  );
}

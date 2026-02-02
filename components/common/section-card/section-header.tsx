"use client";

import { useState } from "react";
import { LucideIcon, EllipsisVertical, SquarePen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const hasSimpleActions = (onEdit || onDelete) && !actions;
  const hasCustomActions = actions && actions.length > 0;
  const showMenu = hasSimpleActions || hasCustomActions;

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

          {/* Simple Edit/Delete → iOS-style dropdown */}
          {hasSimpleActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none"
                  data-testid="section-menu"
                >
                  <EllipsisVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="min-w-[180px] rounded-xl p-1 bg-popover/95 backdrop-blur-xl shadow-lg border border-border/50"
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium cursor-pointer focus:bg-accent"
                  >
                    {editLabel}
                    <SquarePen className="w-4 h-4 text-muted-foreground" />
                  </DropdownMenuItem>
                )}
                {onEdit && onDelete && <DropdownMenuSeparator className="mx-1" />}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium text-red-600 dark:text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
                  >
                    {deleteLabel}
                    <Trash2 className="w-4 h-4" />
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Custom actions → ActionBottomSheet (drawer) */}
          {hasCustomActions && (
            <button
              onClick={() => setSheetOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted"
              data-testid="section-menu"
            >
              <EllipsisVertical className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {hasCustomActions && (
        <ActionBottomSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title={title}
          actions={actions}
        />
      )}
    </>
  );
}

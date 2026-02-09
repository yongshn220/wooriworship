"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SquarePen, Trash2, Download, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface EntityMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  deleteConfig?: {
    title: string;
    description: string;
  };
  editLabel?: string;
  deleteLabel?: string;
  downloadLabel?: string;
  trigger?: React.ReactNode;
  modal?: boolean;
  align?: "start" | "end" | "center";
  className?: string;
  testId?: string;
}

export function EntityMenu({
  onEdit,
  onDelete,
  onDownload,
  deleteConfig = {
    title: "Delete Item?",
    description: "This action cannot be undone.",
  },
  editLabel = "Edit",
  deleteLabel = "Delete",
  downloadLabel = "Download",
  trigger,
  modal = false,
  align = "end",
  className = "",
  testId,
}: EntityMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      await onDelete();
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu modal={modal}>
        <DropdownMenuTrigger asChild>
          {trigger ? (
            <span>{trigger}</span>
          ) : (
            <button
              className={`text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none ${className}`}
              data-testid={testId}
            >
              <EllipsisVertical className="w-5 h-5" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="z-1200 bg-white dark:bg-background">
          {onDownload && (
            <>
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={onDownload}
              >
                {downloadLabel}
                <Download className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuItem>
              {(onEdit || onDelete) && <DropdownMenuSeparator />}
            </>
          )}
          {onEdit && (
            <>
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={onEdit}
                data-testid={testId ? `${testId}-edit` : undefined}
              >
                {editLabel}
                <SquarePen className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuItem>
              {onDelete && <DropdownMenuSeparator />}
            </>
          )}
          {onDelete && (
            <DropdownMenuItem
              className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
              onClick={handleDeleteClick}
              data-testid={testId ? `${testId}-delete` : undefined}
            >
              {deleteLabel}
              <Trash2 className="w-4 h-4" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          setOpen={setIsDeleteDialogOpen}
          title={deleteConfig.title}
          description={deleteConfig.description}
          onDeleteHandler={handleDeleteConfirm}
        />
      )}
    </>
  );
}

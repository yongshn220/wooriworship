"use client";

import { useEffect, useRef, useCallback } from "react";
import { LucideIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export interface ActionBottomSheetAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  actions: ActionBottomSheetAction[];
}

export function ActionBottomSheet({
  open,
  onOpenChange,
  title = "Actions",
  actions,
}: ActionBottomSheetProps) {
  const pendingAction = useRef<(() => void) | null>(null);

  // When drawer closes and there's a pending action, execute it after body styles settle
  useEffect(() => {
    if (!open && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      // Wait one frame for Vaul to process close, then force-reset body styles
      // before opening the next overlay (prevents Vaul/Radix pointer-events conflict)
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = "";
        action();
      });
    }
  }, [open]);

  const handleActionClick = useCallback((action: () => void) => {
    pendingAction.current = action;
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerTitle className="sr-only">{title}</DrawerTitle>

        <div className="px-2 pt-2 pb-8">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isDestructive = action.variant === "destructive";

            return (
              <button
                key={index}
                onClick={() => handleActionClick(action.onClick)}
                className={cn(
                  "w-full min-h-[48px] px-4 py-3 flex items-center rounded-xl text-left",
                  "text-[15px] font-semibold active:bg-accent transition-colors",
                  isDestructive
                    ? "text-red-600 dark:text-red-500"
                    : "text-foreground"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "w-5 h-5 mr-3 shrink-0",
                      isDestructive
                        ? "text-red-600 dark:text-red-500"
                        : "text-muted-foreground"
                    )}
                  />
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

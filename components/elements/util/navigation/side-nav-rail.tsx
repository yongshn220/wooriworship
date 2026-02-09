"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { Music, Bell, Calendar, LayoutGrid } from "lucide-react";
import { getPathManage, getPathNotice, getPathServing, getPathSong } from "@/components/util/helper/routes";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Page } from "@/components/constants/enums";
import { currentPageAtom } from "@/global-states/page-state";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export function SideNavRail() {
  const currentPage = useRecoilValue(currentPageAtom);
  const currentTeamId = useRecoilValue(currentTeamIdAtom);
  const router = useRouter();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const NAV_ITEMS = [
    {
      page: Page.NOTICE_BOARD,
      icon: Bell,
      label: "Notice",
      path: getPathNotice(currentTeamId)
    },
    {
      page: Page.SERVING,
      icon: Calendar,
      label: "Service",
      path: getPathServing(currentTeamId)
    },
    {
      page: Page.SONG_BOARD,
      icon: Music,
      label: "Song",
      path: getPathSong(currentTeamId)
    },
    {
      page: Page.MANAGE,
      icon: LayoutGrid,
      label: "Manage",
      path: getPathManage(currentTeamId)
    },
  ];

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const tabCount = NAV_ITEMS.length;
    let newIndex: number | null = null;

    switch (e.key) {
      case "ArrowDown":
        newIndex = (index + 1) % tabCount;
        break;
      case "ArrowUp":
        newIndex = (index - 1 + tabCount) % tabCount;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabCount - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    tabRefs.current[newIndex]?.focus();
  }, [NAV_ITEMS.length]);

  return (
    <TooltipProvider>
      <aside
        className="z-10 w-[72px] border-r border-border bg-background flex flex-col"
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {/* App Icon */}
        <div className="flex items-center justify-center p-3 pt-4">
          <Image
            src="/image/logo.png"
            alt="App Logo"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>

        <nav
          aria-label="Main navigation"
          role="tablist"
          className="w-full flex flex-col gap-2 p-3"
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive = currentPage === item.page;
            const Icon = item.icon;

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    ref={(el) => { tabRefs.current[index] = el; }}
                    data-testid={`side-nav-${item.label.toLowerCase()}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Navigate to ${item.label}`}
                    tabIndex={isActive ? 0 : -1}
                    className={cn(
                      "relative min-h-[56px] w-full flex items-center justify-center rounded-xl",
                      "transition-all duration-200 ease-out cursor-pointer",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
                      isActive
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => router.push(item.path)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: isActive ? 1 : 1.02 }}
                  >
                    {/* Icon */}
                    <Icon
                      aria-hidden="true"
                      strokeWidth={isActive ? 2.2 : 1.8}
                      className={cn(
                        "w-6 h-6 transition-all duration-200",
                        isActive && "scale-110"
                      )}
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}

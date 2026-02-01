import { useRef, useCallback } from "react";
import { Music2Icon, BellIcon, CalendarDaysIcon, LayoutGridIcon } from "lucide-react";
import { getPathManage, getPathNotice, getPathServing, getPathSong } from "@/components/util/helper/routes";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Page } from "@/components/constants/enums";
import { BaseBottomNavBar } from "@/components/elements/util/navigation/base-bottom-nav-bar";
import { currentPageAtom } from "@/global-states/page-state";
import { motion } from "framer-motion";


export function BoardBottomNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)

  if (currentPage === Page.BOARD) {
    return (<></>)
  }

  // Legacy Worship View removed. Unified Service Board is the standard.
  return (
    <DefaultBoardBottomNavBar />
  )
}

export function DefaultBoardBottomNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const NAV_ITEMS = [
    {
      page: Page.NOTICE_BOARD,
      icon: BellIcon,
      label: "Notice",
      path: getPathNotice(currentTeamId)
    },
    {
      page: Page.SERVING,
      icon: CalendarDaysIcon,
      label: "Service",
      path: getPathServing(currentTeamId)
    },
    {
      page: Page.SONG_BOARD,
      icon: Music2Icon,
      label: "Song",
      path: getPathSong(currentTeamId)
    },
    {
      page: Page.MANAGE,
      icon: LayoutGridIcon,
      label: "Manage",
      path: getPathManage(currentTeamId)
    },
  ]

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const tabCount = NAV_ITEMS.length;
    let newIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight":
        newIndex = (index + 1) % tabCount;
        break;
      case "ArrowLeft":
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
    <BaseBottomNavBar height={80}>
      <div role="tablist" className="w-full h-full flex justify-between px-6 pb-2 items-center">
        {NAV_ITEMS.map((item, index) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;

          return (
            <motion.button
              type="button"
              ref={(el) => { tabRefs.current[index] = el; }}
              key={item.label}
              data-testid={`nav-${item.label.toLowerCase()}`}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "w-16 h-full flex-col flex-center cursor-pointer transition-colors duration-300",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg",
                isActive ? "text-[oklch(0.50_0.188_259.81)] dark:text-primary" : "text-muted-foreground"
              )}
              onClick={() => router.push(item.path)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative mb-1">
                <Icon
                  aria-hidden="true"
                  strokeWidth={isActive ? 3 : 2}
                  className={cn("w-6 h-6 transition-colors duration-300")}
                />
              </div>
              <span className={cn(
                "text-xs prevent-text-select transition-colors duration-300",
                isActive ? "font-bold text-[oklch(0.50_0.188_259.81)] dark:text-primary" : "font-medium text-muted-foreground"
              )}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </BaseBottomNavBar>
  )
}

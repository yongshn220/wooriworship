import { HomeIcon, Music2Icon, BellIcon, CalendarDaysIcon, LayoutGridIcon, DownloadIcon, UserIcon } from "lucide-react";
import { getPathHome, getPathManage, getPathNotice, getPathServing, getPathSong } from "@/components/util/helper/routes";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Page } from "@/components/constants/enums";
import { BaseBottomNavBar } from "@/components/elements/util/navigation/base-bottom-nav-bar";
import { currentPageAtom } from "@/global-states/page-state";
import { Button } from "@/components/ui/button";
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

  const NAV_ITEMS = [
    {
      page: Page.NOTICE_BOARD,
      icon: BellIcon,
      label: "Notice",
      path: getPathNotice(currentTeamId)
    },
    {
      page: Page.SERVING,
      icon: CalendarDaysIcon, // Changed from UserIcon to CalendarDaysIcon
      label: "Service", // Renamed from Serving
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

  return (
    <BaseBottomNavBar height={80}>
      <div className="w-full h-full flex justify-between px-6 pb-2 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              className={cn(
                "w-16 h-full flex-col flex-center cursor-pointer transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => router.push(item.path)}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative mb-1">
                <Icon
                  strokeWidth={isActive ? 3 : 2}
                  className={cn("w-6 h-6 transition-all duration-300")}
                />
              </div>
              <p className={cn(
                "text-xs prevent-text-select transition-all duration-300",
                isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
              )}>
                {item.label}
              </p>
            </motion.div>
          )
        })}
      </div>
    </BaseBottomNavBar>
  )
}

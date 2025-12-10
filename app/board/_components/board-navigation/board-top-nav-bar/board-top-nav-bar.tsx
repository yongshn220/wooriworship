import { Page } from "@/components/constants/enums";
import { FilterIcon, SquarePenIcon, SearchIcon, MenuIcon } from "lucide-react";
import React, { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { SearchInput } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-input";
import { getPathCreateNotice, getPathCreatePlan, getPathCreateSong } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { SearchPlan } from "./search-plan";
import { BaseTopNavBar } from "@/components/elements/util/navigation/base-top-nav-bar";
import { MainLogoSmall } from "@/components/elements/util/logo/main-logo";
import { currentPageAtom } from "@/global-states/page-state";
import { motion } from "framer-motion";

interface HeaderConfig {
  title?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
  bottomComponent?: React.ReactNode;
  height: number;
}

export function BoardTopNavBar() {
  const currentPage = useRecoilValue(currentPageAtom);
  const teamId = useRecoilValue(currentTeamIdAtom);
  const router = useRouter();

  // Premium 3D Button Component
  const ActionButton = ({ onClick, icon: Icon, label }: { onClick: () => void, icon: any, label?: string }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, rotateX: 10, rotateY: 10, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
      <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
      {label && <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">{label}</span>}
    </motion.button>
  );

  const config: Partial<Record<Page, HeaderConfig>> = useMemo(() => {
    const defaultConfig: HeaderConfig = {
      title: "",
      height: 56,
      showLogo: true
    };

    return {
      [Page.NOTICE_BOARD]: {
        title: "Notice",
        height: 80,
        actions: (
          <ActionButton onClick={() => router.push(getPathCreateNotice(teamId))} icon={SquarePenIcon} label="Write" />
        ),
      },
      [Page.SONG_BOARD]: {
        title: "Song Board",
        height: 130, // Slightly taller for better spacing
        actions: (
          <ActionButton onClick={() => router.push(getPathCreateSong(teamId))} icon={SquarePenIcon} label="New Song" />
        ),
        bottomComponent: (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-2"
          >
            <SearchInput />
          </motion.div>
        )
      },
      [Page.WORSHIP_BOARD]: {
        title: "Worship Plan",
        height: 130,
        actions: (
          <ActionButton onClick={() => router.push(getPathCreatePlan(teamId))} icon={SquarePenIcon} label="New Plan" />
        ),
        bottomComponent: (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-2"
          >
            <SearchPlan />
          </motion.div>
        )
      },
      [Page.MANAGE]: {
        title: "Manage",
        height: 80,
      },
      [Page.BOARD]: defaultConfig,
      [Page.HOME]: defaultConfig,
      [Page.WORSHIP]: defaultConfig,
    };
  }, [teamId, router]);

  const currentConfig = config[currentPage];

  // Explicitly hidden pages logic
  if ([Page.CREATE_WORSHIP, Page.EDIT_WORSHIP, Page.CREATE_SONG, Page.EDIT_SONG].includes(currentPage)) {
    return null;
  }

  // Fallback for undefined pages
  if (!currentConfig) return <></>;

  return (
    <BaseTopNavBar height={currentConfig.height} className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-lg shadow-gray-200/40 z-50 supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
      <div className="w-full h-full flex flex-col justify-between max-w-7xl mx-auto">
        <div className="flex-1 flex items-center justify-between px-6 pt-3">
          {/* Left Side: Title or Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {currentConfig.showLogo ? (
              <div className="opacity-90 hover:opacity-100 transition-opacity">
                <MainLogoSmall />
              </div>
            ) : (
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                {currentConfig.title}
              </h1>
            )}
          </motion.div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2">
            {currentConfig.actions}
          </div>
        </div>

        {/* Bottom Component (Search/Filter) */}
        {currentConfig.bottomComponent && (
          <div className="px-6 pb-3 w-full">
            {currentConfig.bottomComponent}
          </div>
        )}
      </div>
    </BaseTopNavBar>
  );
}

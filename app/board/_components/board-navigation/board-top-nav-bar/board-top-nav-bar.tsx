import { Page } from "@/components/constants/enums";
import { FilterIcon, SquarePenIcon, SearchIcon, MenuIcon, XIcon, ArrowLeftIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { SearchInput } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-input";
import { getPathCreateNotice, getPathCreatePlan, getPathCreateSong } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { SearchPlan } from "./search-plan";
import { BaseTopNavBar } from "@/components/elements/util/navigation/base-top-nav-bar";
import { MainLogoSmall } from "@/components/elements/util/logo/main-logo";
import { currentPageAtom } from "@/global-states/page-state";
import { motion, AnimatePresence } from "framer-motion";
import { planSearchInputAtom, songSearchInputAtom } from "@/app/board/_states/board-states";

interface HeaderConfig {
  title?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
  searchComponent?: React.ReactNode;
}

export function BoardTopNavBar() {
  const currentPage = useRecoilValue(currentPageAtom);
  const teamId = useRecoilValue(currentTeamIdAtom);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const setSongSearch = useSetRecoilState(songSearchInputAtom);
  const setPlanSearch = useSetRecoilState(planSearchInputAtom);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    // Reset search inputs based on current page or just reset all to be safe/simple
    if (currentPage === Page.SONG_BOARD) setSongSearch("");
    if (currentPage === Page.WORSHIP_BOARD) setPlanSearch("");
  };

  // Premium 3D Button Component
  const ActionButton = ({ onClick, icon: Icon, label, variant = 'default' }: { onClick: () => void, icon: any, label?: string, variant?: 'default' | 'ghost' }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, rotateX: 10, rotateY: 10, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${variant === 'default' ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md' : 'hover:bg-gray-100/50'}`}
      style={{ perspective: 1000 }}
    >
      {variant === 'default' && <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />}
      <Icon className={`w-5 h-5 transition-colors ${variant === 'default' ? 'text-gray-600 group-hover:text-blue-600' : 'text-gray-500 group-hover:text-gray-800'}`} />
      {label && <span className={`text-sm font-medium transition-colors ${variant === 'default' ? 'text-gray-600 group-hover:text-blue-600' : 'text-gray-500 group-hover:text-gray-800'}`}>{label}</span>}
    </motion.button>
  );

  const config: Partial<Record<Page, HeaderConfig>> = useMemo(() => {
    const defaultConfig: HeaderConfig = {
      title: "",
      showLogo: true
    };

    return {
      [Page.NOTICE_BOARD]: {
        title: "Notice",
        actions: (
          <ActionButton onClick={() => router.push(getPathCreateNotice(teamId))} icon={SquarePenIcon} label="Write" />
        ),
      },
      [Page.SONG_BOARD]: {
        title: "Song Board",
        actions: (
          <ActionButton onClick={() => router.push(getPathCreateSong(teamId))} icon={SquarePenIcon} label="New Song" />
        ),
        searchComponent: <SearchInput />
      },
      [Page.WORSHIP_BOARD]: {
        title: "Worship Plan",
        actions: (
          <ActionButton onClick={() => router.push(getPathCreatePlan(teamId))} icon={SquarePenIcon} label="New Plan" />
        ),
        searchComponent: <SearchPlan />
      },
      [Page.MANAGE]: {
        title: "Manage",
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
    <BaseTopNavBar height={64} className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-lg shadow-gray-200/40 z-50 supports-[backdrop-filter]:bg-white/60 transition-all duration-300 overflow-hidden">
      <div className="w-full h-full max-w-7xl mx-auto px-4 relative flex items-center">
        <AnimatePresence mode="wait">
          {isSearchOpen && currentConfig.searchComponent ? (
            <motion.div
              key="search-mode"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex items-center gap-2"
            >
              <div className="flex-1">
                {currentConfig.searchComponent}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseSearch}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <XIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="title-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center justify-between"
            >
              {/* Left Side: Title or Logo */}
              <div className="flex items-center gap-3">
                {currentConfig.showLogo ? (
                  <div className="opacity-90 hover:opacity-100 transition-opacity">
                    <MainLogoSmall />
                  </div>
                ) : (
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                    {currentConfig.title}
                  </h1>
                )}
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-2">
                {currentConfig.searchComponent && (
                  <ActionButton
                    onClick={() => setIsSearchOpen(true)}
                    icon={SearchIcon}
                    variant="ghost"
                  />
                )}
                {currentConfig.actions}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseTopNavBar>
  );
}

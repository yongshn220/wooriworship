"use client"

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Download,
  Music,
  Play
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  getDayPassedFromTimestampShorten,
  timestampToDateStringFormatted,
  isTimestampPast
} from "@/components/util/helper/helper-functions";
import { getPathSongDetail, getPathWorshipView } from "@/components/util/helper/routes";

import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { worshipAtom, worshipSongListAtom } from "@/global-states/worship-state";
import { userAtom } from "@/global-states/userState";
import { planSearchInputAtom } from "@/app/board/_states/board-states";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";
import { DownloadMusicSheetDialog } from "@/app/board/[teamId]/(worship)/worship-board/_components/download-music-sheet-dialog";
import { WorshipHeaderMenu } from "./worship-header-menu";

interface Props {
  worshipId: string;
  isFirst?: boolean;
}

// Helper to normalize text for search
function normalizeText(text: string) {
  return text?.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase() || "";
}

// Helper to highlight text
function highlightText(text: string, highlight: string) {
  if (!text || text === "") return "";
  if (!highlight) return text;
  const normalizedText = normalizeText(text);
  const normalizedHighlight = normalizeText(highlight);

  if (normalizedText.includes(normalizedHighlight)) {
    return <span className="bg-yellow-200 rounded px-0.5">{text}</span>;
  }
  return text;
}

export function WorshipCard({ worshipId, isFirst }: Props) {
  const router = useRouter();
  const teamId = useRecoilValue(currentTeamIdAtom);
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);

  const worship = useRecoilValue(worshipAtom(worshipId));

  const [isExpanded, setIsExpanded] = useState(() => {
    if (searchParams.get("expanded") === worshipId) return true;
    if (isFirst && worship && !isTimestampPast(worship.worship_date)) return true;
    return false;
  });
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // Auto-scroll to this card if it's the expanded one from URL
  useEffect(() => {
    if (searchParams.get("expanded") === worshipId) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams, worshipId]);

  // State Selectors
  const team = useRecoilValue(teamAtom(teamId));
  // Safe access to created_by info
  const creatorId = worship?.created_by?.id || "";
  const creator = useRecoilValue(userAtom(creatorId));
  const worshipSongListLoadable = useRecoilValueLoadable(worshipSongListAtom(worshipId));
  const searchInput = useRecoilValue(planSearchInputAtom);

  // Derived Values
  const songs = worshipSongListLoadable.state === 'hasValue' ? worshipSongListLoadable.contents : [];

  // Search Filtering Logic
  const normalizedSearchInput = useMemo(() => normalizeText(searchInput), [searchInput]);
  const normalizedWorshipTitle = useMemo(() => normalizeText(worship?.title), [worship?.title]);

  const shouldRenderCard = useMemo(() => {
    if (!normalizedSearchInput) return true;
    if (normalizedWorshipTitle.includes(normalizedSearchInput)) return true;
    return songs.some(song =>
      normalizeText(song?.title).includes(normalizedSearchInput) ||
      normalizeText(song?.subtitle).includes(normalizedSearchInput)
    );
  }, [normalizedSearchInput, normalizedWorshipTitle, songs]);

  if (!shouldRenderCard || !worship) return null;

  // Handlers
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleStartWorship = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(getPathWorshipView(teamId, worship.id));
  };



  const hasLink = !!worship.link;
  const isPast = worship ? isTimestampPast(worship.worship_date) : false;

  return (
    <motion.div
      ref={cardRef}
      layout
      className="w-full mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-md cursor-pointer",
          (isExpanded || !isPast) ? 'bg-white' : 'bg-gray-50', // Apply background based on isExpanded and isPast
          isExpanded ? "ring-2 ring-blue-500/10" : ""
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4 group cursor-pointer" onClick={handleToggleExpand}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{timestampToDateStringFormatted(worship.worship_date)}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isPast ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700 font-medium"
                )}>
                  {getDayPassedFromTimestampShorten(worship.worship_date)}
                </span>
              </div>
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                {highlightText(worship.title || "Untitled Service", searchInput)}
                {isExpanded && <ChevronUp className="h-6 w-6 text-gray-400 animate-in fade-in zoom-in duration-300" />}
              </h2>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <WorshipHeaderMenu worshipId={worship.id} createdById={worship.created_by.id} teamId={teamId} />
            </div>
          </div>


          <AnimatePresence mode="wait">
            {!isExpanded ? (
              /* Collapsed View */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 pl-1 sm:pl-2"
              >
                {songs.slice(0, 5).map((song, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    <span className="font-medium text-sm line-clamp-1">
                      {highlightText(song?.title, searchInput)}
                    </span>
                    {song?.keys?.[0] && (
                      <span className="text-xs sm:text-sm text-gray-500 shrink-0">
                        ({song.keys[0]})
                      </span>
                    )}
                  </div>
                ))}
                {songs.length > 5 && (
                  <p className="text-xs text-gray-400 pl-4 py-1">
                    + {songs.length - 5} more songs...
                  </p>
                )}
              </motion.div>
            ) : (
              /* Expanded View */
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Meta Data Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {team?.name && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm">
                        {team.name}
                      </Badge>
                    )}
                    {creator?.name && (
                      <div className="flex items-center gap-1 sm:gap-2 font-medium text-gray-900 px-2 py-1 bg-gray-50 rounded-md text-xs sm:text-sm">
                        <span className="text-gray-500 font-normal hidden sm:inline">Created by</span>
                        {creator.name}
                      </div>
                    )}

                  </div>
                </div>

                {/* Description (Context) */}
                {worship.description && (
                  <div className="relative pl-4 border-l-2 border-blue-100 py-1 my-2">
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {worship.description}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Actions & List Header */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-800">
                        <Music className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                        Song List
                      </div>

                      <div className="flex items-center gap-1">
                        {hasLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-gray-500 hover:text-blue-600 h-8 text-xs sm:text-sm px-2 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={worship.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                              Link
                            </a>
                          </Button>
                        )}
                        <DownloadMusicSheetDialog worshipId={worship.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-900 h-8 text-xs sm:text-sm px-2 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                            Download
                          </Button>
                        </DownloadMusicSheetDialog>
                      </div>
                    </div>
                  </div>

                  {/* Rich Song List */}
                  <div className="bg-gray-50 rounded-xl p-2 sm:p-3 flex flex-col gap-1">
                    {songs.map((song, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (song?.id) setSelectedSongId(song.id);
                        }}
                      >
                        <div className="w-10 sm:w-12 flex justify-center shrink-0">
                          {song?.keys?.[0] ? (
                            <Badge variant="outline" className="font-mono text-sm sm:text-base font-bold border-gray-300 text-gray-700 bg-white px-1.5 sm:px-2.5">
                              {song.keys[0]}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 bg-gray-50 text-xs sm:text-sm">?</Badge>
                          )}
                        </div>

                        <span className="font-medium text-gray-900 text-base sm:text-lg line-clamp-1">
                          {highlightText(song?.title, searchInput)}
                        </span>
                      </div>
                    ))}
                    {songs.length === 0 && (
                      <div className="p-6 sm:p-8 text-center text-gray-400 italic text-sm">
                        No songs added yet.
                      </div>
                    )}
                  </div>

                  <Button size="sm" onClick={handleStartWorship} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 sm:h-10 text-sm sm:text-base font-semibold">
                    <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    Start Worship
                  </Button>


                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Song Detail Drawer */}
      {selectedSongId && (
        <SongDetailDialog
          teamId={teamId}
          isOpen={!!selectedSongId}
          setIsOpen={(open: boolean) => !open && setSelectedSongId(null)}
          songId={selectedSongId}
          readOnly={true}
        />
      )}
    </motion.div>
  )
}

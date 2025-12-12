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
  Play,
  ClipboardList,
  Sparkles
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Separator } from "@/components/ui/separator";

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
import { ServingRosterDialog } from "@/components/elements/dialog/serving/serving-roster-dialog";
import { format } from "date-fns";
import { ServingService } from "@/apis";
import { auth } from "@/firebase";
import { ServingSchedule } from "@/models/serving";
import { MyServingIndicator } from "./my-serving-indicator";

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
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

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
    if (worship?.subtitle && normalizeText(worship.subtitle).includes(normalizedSearchInput)) return true;
    return songs.some(song =>
      normalizeText(song?.title).includes(normalizedSearchInput) ||
      normalizeText(song?.subtitle).includes(normalizedSearchInput)
    );
  }, [normalizedSearchInput, normalizedWorshipTitle, worship?.subtitle, songs]);

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
          (isExpanded || !isPast) ? 'bg-card' : 'bg-muted/30', // Apply background based on isExpanded and isPast
          isExpanded ? "ring-2 ring-primary" : ""
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4 group cursor-pointer" onClick={handleToggleExpand}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{timestampToDateStringFormatted(worship.worship_date)}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isPast ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary font-medium"
                )}>
                  {getDayPassedFromTimestampShorten(worship.worship_date)}
                </span>

                {/* My Serving Indicator */}
                <MyServingIndicator teamId={teamId} date={format(worship.worship_date.toDate(), "yyyy-MM-dd")} />
              </div>
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {highlightText(worship.title || "Untitled Service", searchInput)}
                {worship.subtitle && (
                  <span className="text-base sm:text-lg font-normal text-muted-foreground ml-2">
                    {highlightText(worship.subtitle, searchInput)}
                  </span>
                )}
                {isExpanded && <ChevronUp className="h-6 w-6 text-muted-foreground animate-in fade-in zoom-in duration-300" />}
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
                  <div key={idx} className="flex items-center gap-2 text-foreground">
                    {song?.keys?.[0] && (
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {song.keys[0]}
                      </span>
                    )}
                    <span className="font-medium text-sm line-clamp-1">
                      {highlightText(song?.title, searchInput)}
                    </span>
                  </div>
                ))}
                {songs.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-4 py-1">
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
                className="space-y-3"
              >
                {/* Service Members Button */}
                <div className="flex items-center gap-2">
                  <ServingRosterDialog
                    teamId={teamId}
                    date={format(worship.worship_date.toDate(), "yyyy-MM-dd")}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                        <ClipboardList className="h-4 w-4" />
                        Serving Members
                      </Button>
                    }
                  />
                </div>

                {/* Description (Context) */}
                {worship.description && (
                  <div className="relative pl-4 border-l-2 border-primary/20 py-1 my-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {worship.description}
                    </p>
                  </div>
                )}


                <Separator className="my-1" />

                <div className="space-y-3">


                  {/* Rich Song List */}
                  <div className="bg-muted/30 rounded-xl p-2 sm:p-3 flex flex-col gap-1">
                    {songs.map((song, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-card hover:shadow-sm transition-all duration-200 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (song?.id) setSelectedSongId(song.id);
                        }}
                      >
                        <div className="w-10 sm:w-12 flex justify-center shrink-0">
                          {song?.keys?.[0] ? (
                            <Badge variant="outline" className="font-mono text-sm sm:text-base font-bold border-border text-foreground bg-card px-1.5 sm:px-2.5">
                              {song.keys[0]}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground bg-muted text-xs sm:text-sm">?</Badge>
                          )}
                        </div>

                        <span className="font-medium text-foreground text-base sm:text-lg line-clamp-1">
                          {highlightText(song?.title, searchInput)}
                        </span>
                      </div>
                    ))}
                    {songs.length === 0 && (
                      <div className="p-6 sm:p-8 text-center text-muted-foreground italic text-sm">
                        No songs added yet.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleStartWorship} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-10 sm:h-10 text-sm sm:text-base font-semibold rounded-full">
                      <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      Start Worship
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full shrink-0 border-2 border-primary text-primary font-bold shadow-md hover:shadow-lg hover:bg-primary/5 transition-all justify-center"
                        >
                          <ChevronUp className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-1 mb-2" align="end" side="top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          {hasLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="justify-start h-9 w-full font-normal"
                            >
                              <a
                                href={worship.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Link
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start h-9 w-full font-normal"
                            onClick={() => setIsDownloadDialogOpen(true)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>


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

      {/* Download Dialog */}
      <DownloadMusicSheetDialog
        worshipId={worshipId}
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
      />
    </motion.div>
  )
}

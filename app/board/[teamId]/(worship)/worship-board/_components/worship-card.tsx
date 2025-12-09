"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/util/helper/helper-functions";
import { getPathWorship } from "@/components/util/helper/routes";

import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { worshipAtom, worshipSongListAtom } from "@/global-states/worship-state";
import { userAtom } from "@/global-states/userState";
import { planSearchInputAtom } from "@/app/board/_states/board-states";

interface Props {
  worshipId: string
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

export function WorshipCard({ worshipId }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // State Selectors
  const teamId = useRecoilValue(currentTeamIdAtom);
  const worship = useRecoilValue(worshipAtom(worshipId));
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
    router.push(getPathWorship(teamId, worship.id));
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Coming Soon",
      description: "Download functionality is under development.",
    });
  };

  const hasLink = !!worship.link;

  return (
    <motion.div
      layout
      className="w-full mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 border bg-white shadow-sm hover:shadow-md cursor-pointer",
          isExpanded ? "ring-2 ring-blue-500/10" : ""
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{timestampToDateStringFormatted(worship.worship_date)}</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">
                  {getDayPassedFromTimestampShorten(worship.worship_date)}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {highlightText(worship.title || "Untitled Service", searchInput)}
              </h2>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              className="text-gray-500 hover:text-gray-900"
            >
              {isExpanded ? (
                <span className="flex items-center gap-1 font-medium">
                  Collapse <ChevronUp className="h-4 w-4" />
                </span>
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {!isExpanded ? (
              /* Collapsed View */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 pl-2"
              >
                {songs.slice(0, 5).map((song, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span className="font-medium text-sm">
                      {highlightText(song?.title, searchInput)}
                    </span>
                    {song?.keys?.[0] && (
                      <span className="text-sm text-gray-500">
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
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {team?.name && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {team.name}
                    </Badge>
                  )}
                  {creator?.name && (
                    <div className="flex items-center gap-2 font-medium text-gray-900 px-2 py-1 bg-gray-50 rounded-md">
                      <span className="text-gray-500 font-normal">Created by</span>
                      {creator.name}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>12 views</span>
                  </div>
                  {hasLink && (
                    <a
                      href={worship.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Reference
                    </a>
                  )}
                </div>

                {/* Actions & List Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Music className="h-5 w-5 text-gray-500" />
                    Song List
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="text-gray-600">
                      <Download className="mr-2 h-4 w-4" />
                      Download Sheets
                    </Button>
                    <Button size="sm" onClick={handleStartWorship} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Start Worship
                    </Button>
                  </div>
                </div>

                {/* Rich Song List */}
                <div className="border rounded-xl divide-y bg-gray-50/50">
                  {songs.map((song, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-white transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="min-w-[2.5rem] flex justify-center">
                          {song?.keys?.[0] ? (
                            <Badge variant="outline" className="font-mono text-base font-bold border-gray-300 text-gray-700 bg-white">
                              {song.keys[0]}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 bg-gray-50">?</Badge>
                          )}
                        </span>

                        <span className="font-medium text-gray-900 text-lg">
                          {highlightText(song?.title, searchInput)}
                        </span>
                      </div>
                      {/* Tags removed as requested */}
                    </div>
                  ))}
                  {songs.length === 0 && (
                    <div className="p-8 text-center text-gray-400 italic">
                      No songs added yet.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

"use client"

import {
  getDayByTimestamp,
  getDayPassedFromTimestampShorten, isTimestampPast,
  timestampToDateStringFormatted
} from "@/components/helper/helper-functions";
import {getPathWorship} from "@/components/helper/routes";
import {useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {worshipAtom, worshipSongListAtom} from "@/global-states/worship-state";
import {useRouter} from "next/navigation";
import { planSearchInputAtom } from "@/app/board/_states/board-states";
import { useMemo } from "react";

interface Props {
  worshipId: string
}

// Function to normalize text by removing spaces, special characters (excluding Korean), and converting to lowercase
function normalizeText(text: string) {
  return text?.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
}

// Function to highlight matched text
function highlightText(text: string, highlight: string) {
  if (!text || text === "") return "";
  if (!highlight) return text;
  const normalizedText = normalizeText(text);
  const normalizedHighlight = normalizeText(highlight);
  
  if (normalizedText.includes(normalizedHighlight)) {
    return <span style={{ backgroundColor: 'yellow' }}>{text}</span>;
  }
  return text;
}

export function WorshipCard({worshipId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const worship = useRecoilValue(worshipAtom(worshipId))
  const worshipSongListLoadable = useRecoilValueLoadable(worshipSongListAtom(worshipId))
  const router = useRouter()
  const searchInput = useRecoilValue(planSearchInputAtom); // Load the search input value

  // Normalize the search input
  const normalizedSearchInput = useMemo(() => normalizeText(searchInput), [searchInput]);

  // Precompute normalized worship title and song titles/subtitles
  const normalizedWorshipTitle = useMemo(() => normalizeText(worship?.title), [worship?.title]);
  const normalizedWorshipSongs = useMemo(() => {
    if (worshipSongListLoadable.state === 'hasValue') {
      return worshipSongListLoadable.contents.map(song => ({
        title: normalizeText(song?.title),
        subtitle: normalizeText(song?.subtitle)
      }));
    }
    return [];
  }, [worshipSongListLoadable]);

  // Check if the card should be rendered based on the search input
  const shouldRenderCard = useMemo(() => {
    if (!normalizedSearchInput) return true;
    if (normalizedWorshipTitle.includes(normalizedSearchInput)) return true;
    return normalizedWorshipSongs.some(song => 
      song.title?.includes(normalizedSearchInput) || song.subtitle?.includes(normalizedSearchInput)
    );
  }, [normalizedSearchInput, normalizedWorshipTitle, normalizedWorshipSongs]);

  if (!shouldRenderCard) return null;

  return (
    <div onClick={() => router.push(getPathWorship(teamId, worship.id))}>
      <div className="group md:aspect-[1/1] rounded-lg flex flex-col bg-white overflow-hidden cursor-pointer p-4 border">
        <div className="flex flex-col pb-2 border-b">
          <div className="flex-between items-center w-full">
            <p className="text-sm text-gray-600">{timestampToDateStringFormatted(worship?.worship_date)}
              <span className="text-xs"> ({getDayByTimestamp(worship?.worship_date)})</span>
            </p>
            {
              isTimestampPast(worship?.worship_date) === false &&
              <p className="text-xs text-gray-500">{getDayPassedFromTimestampShorten(worship?.worship_date)}</p>
            }
          </div>
          <div className="font-semibold text-lg">
            {worship?.title === "" ? "No title" : highlightText(worship?.title, searchInput)}
          </div>
        </div>
        <div className="h-full flex flex-col justify-start gap-3 py-4">
          {
            worshipSongListLoadable.state === 'hasValue' &&
            worshipSongListLoadable.contents.map((song, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <p className="line-clamp-1 text-base sm:text-sm">
                  {highlightText(song?.title, searchInput)} 
                  {song?.subtitle && (
                    <span className="text-sm text-gray-500">
                      ({highlightText(song.subtitle, searchInput)})
                    </span>
                  )}
                </p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

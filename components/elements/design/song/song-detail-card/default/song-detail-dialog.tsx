import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Suspense, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { X } from "lucide-react";

import { songAtom } from "@/global-states/song-state";
import { musicSheetAtom, musicSheetIdsAtom } from "@/global-states/music-sheet-state";

import { SongDetailContent } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-content";
import { SongCommentArea } from "@/components/elements/design/song/song-detail-card/default/parts/song-comment-area";
import { SongDetailMusicSheetArea } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-music-sheet-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailDialog({ teamId, isOpen, setIsOpen, songId, readOnly = false }: Props) {
  const song = useRecoilValue(songAtom(songId));
  const musicSheetIds = useRecoilValue(musicSheetIdsAtom(songId));
  const [selectedMusicSheetId, setSelectedMusicSheetId] = useState<string>("");

  useEffect(() => {
    if (musicSheetIds && musicSheetIds.length > 0) {
      setSelectedMusicSheetId(musicSheetIds[0]);
    }
  }, [musicSheetIds]);

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-screen rounded-none flex flex-col focus:outline-none mt-0">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-3 border-b bg-white z-20 shrink-0">
          {/* Key Selector (Left) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[30%]">
            {musicSheetIds?.map((id) => (
              <KeyBadge
                key={id}
                musicSheetId={id}
                isSelected={id === selectedMusicSheetId}
                onClick={() => setSelectedMusicSheetId(id)}
              />
            ))}
          </div>

          {/* Title (Center) */}
          <div className="flex-1 px-2 text-center">
            <h3 className="font-bold text-lg leading-tight break-keep line-clamp-2">
              {song?.title || "Untitled"}
            </h3>
          </div>

          {/* Exit (Right) */}
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
          <Suspense fallback={<div className="h-full flex-center">Loading...</div>}>

            {/* Full Screen Sheet Area */}
            <div className="w-full min-h-[calc(100vh-70px)] flex flex-col">
              {selectedMusicSheetId && (
                <SongDetailMusicSheetArea musicSheetId={selectedMusicSheetId} />
              )}
            </div>

            {/* Info Section (Below) */}
            <div className="bg-white p-4 pb-10 rounded-t-xl -mt-4 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <SongDetailContent songId={songId} />
              <div className="mt-8">
                <SongCommentArea teamId={teamId} songId={songId} />
              </div>
            </div>

          </Suspense>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function KeyBadge({ musicSheetId, isSelected, onClick }: { musicSheetId: string, isSelected: boolean, onClick: () => void }) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId));
  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className={`cursor-pointer h-8 px-2.5 flex-center transition-all ${isSelected ? 'bg-blue-600 hover:bg-blue-700 border-transparent' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
      onClick={onClick}
    >
      {musicSheet?.key || "?"}
    </Badge>
  )
}

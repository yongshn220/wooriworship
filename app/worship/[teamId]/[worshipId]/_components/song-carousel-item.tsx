import {Card, CardContent} from "@/components/ui/card";
import {CarouselItem} from "@/components/ui/carousel";
import * as React from "react";
import {WorshipSongHeader} from "@/models/worship";
import Image from 'next/image'
import {songAtom} from "@/global-states/song-state";
import {useRecoilValue} from "recoil";
import {musicSheetAtom, musicSheetsByIdsAtom} from "@/global-states/music-sheet-state";

interface Props {
  songHeader: WorshipSongHeader
}

export function SongCarouselItemWrapper({songHeader}: Props) {
  const musicSheets = useRecoilValue(musicSheetsByIdsAtom(songHeader?.selected_music_sheet_ids))

  return (
    <React.Fragment>
      {
        musicSheets?.map((musicSheet, index) => (
          <SongCarouselItem key={index} songId={songHeader?.id} note={songHeader?.note} urls={musicSheet?.urls}/>
        ))
      }
    </React.Fragment>
  )
}

interface SongCarouselItemProps {
  songId: string,
  note: string,
  urls: Array<string>
}

export function SongCarouselItem({songId, note, urls}: SongCarouselItemProps) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <CarouselItem >
      <div className="w-full py-2 text-md mb-2">{note}</div>
      <Card>
        <CardContent className="flex flex-col w-full aspect-[4/5] max-h-[800px] divide-y">
          <div className="relative h-full flex flex-col bg-gray-50 overflow-y-scroll">
            {
              urls.length > 0 ?
                urls.map((url, index) => (
                  <div key={index} className="flex-center w-full h-full">
                    <img
                      alt="Music score"
                      src={url}
                      className="h-full object-contain rounded-md"
                    />
                  </div>
                ))
              :
                <div className="w-full h-full flex-center flex-col">
                  <Image
                    alt="compose music image"
                    src="/illustration/noImage.svg"
                    width={300}
                    height={300}
                  />
                  <p className="w-full text-center mt-4 text-lg ">
                    No music sheet for &quot;<span className="font-semibold">{song.title}</span>&quot;
                  </p>
                </div>
            }
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  )
}

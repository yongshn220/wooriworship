import {Dialog, DialogContent} from "@/components/ui/dialog";
import Image from "next/image";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {Card, CardContent} from "@/components/ui/card";
import * as React from "react";

interface Props {
  isOpen: boolean,
  setIsOpen: Function
  musicSheetUrls: Array<string>
}

export function SongMusicSheetViewer({isOpen, setIsOpen, musicSheetUrls}: Props) {

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="sm:max-w-[600px] h-5/6">
        <div className="relative flex-center w-full h-full">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {
                musicSheetUrls.map((url, index) => (
                  <CarouselItem key={index} className="relative h-full">
                    <Card className="h-full">
                      <CardContent className="flex flex-col w-full h-full divide-y">
                        <div key={index} className="flex-center w-full h-full">
                          <Image
                            alt="Music score"
                            src={url}
                            fill
                            sizes="100vw"
                            className="h-full object-contain rounded-md p-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  )
}

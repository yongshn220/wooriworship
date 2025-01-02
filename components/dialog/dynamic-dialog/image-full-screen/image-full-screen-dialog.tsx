import {Dialog, DialogContent} from "@/components/ui/dialog";
import Image from "next/image";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {Card, CardContent} from "@/components/ui/card";
import * as React from "react";

interface Props {
  isOpen: boolean,
  setIsOpen: Function
  imageUrls: string[]
}

export function ImageFullScreenDialog({isOpen, setIsOpen, imageUrls}: Props) {

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="w-full h-full bg-black p-2 m-0">
          <Carousel className="w-full h-full bg-gray-50">
            <CarouselContent className="">
              {
                imageUrls?.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-screen">
                      <Image
                        alt="Full screen image"
                        src={url}
                        fill
                        sizes=""
                        className="object-contain rounded-md"
                      />
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
          </Carousel>
      </DialogContent>
    </Dialog>
  )
}

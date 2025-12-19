import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useState } from "react";

interface Props {
  isOpen: boolean,
  setIsOpen: Function
  imageUrls: string[]
}

export function ImageFullScreenDialog({ isOpen, setIsOpen, imageUrls }: Props) {

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContent className="w-full h-full max-w-8xl bg-black p-2 m-0 ">
        <Carousel className="w-full h-full bg-gray-50">
          <CarouselContent className="">
            {
              imageUrls?.map((url, index) => (
                <FullScreenImageItem key={index} url={url} />
              ))}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}

function FullScreenImageItem({ url }: { url: string }) {
  const [enablePan, setEnablePan] = useState(false)

  return (
    <CarouselItem>
      <div className="relative h-screen w-full flex-center bg-black overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          wheel={{ disabled: true }}
          panning={{ disabled: !enablePan }}
          onTransformed={(e) => {
            setEnablePan(e.state.scale > 1.01)
          }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <div className="relative w-full h-full flex-center">
              <Image
                alt="Full screen image"
                src={url}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </CarouselItem>
  )
}

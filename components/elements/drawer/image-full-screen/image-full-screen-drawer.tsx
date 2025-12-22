"use client"

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
    imageUrls: string[]
}

export function ImageFullScreenDrawer({ isOpen, setIsOpen, imageUrls }: Props) {
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="h-[100dvh] bg-black border-none p-0 overflow-hidden">
                {/* Close hint/handle is already provided by DrawerContent in @/components/ui/drawer */}
                <div className="w-full h-full">
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {imageUrls?.map((url, index) => (
                                <FullScreenImageItem key={index} url={url} />
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function FullScreenImageItem({ url }: { url: string }) {
    const [enablePan, setEnablePan] = useState(false)

    return (
        <CarouselItem className="h-[100dvh] p-0">
            <div className="relative h-full w-full flex-center bg-black overflow-hidden">
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={4}
                    wheel={{ disabled: true }}
                    doubleClick={{ mode: "toggle" }}
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
                            {/* Overlay to catch events and prevent default image behavior if needed, 
                  similar to worship-live-carousel-item.tsx */}
                            <div
                                className="absolute inset-0 z-10"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                            />
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </CarouselItem>
    )
}

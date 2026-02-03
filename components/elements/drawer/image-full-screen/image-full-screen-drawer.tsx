"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";

interface Props {
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
    imageUrls: string[]
}

export function ImageFullScreenDrawer({ isOpen, setIsOpen, imageUrls }: Props) {
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="h-[100dvh] bg-black border-none p-0 overflow-hidden">
                <VisuallyHidden>
                    <DrawerHeader>
                        <DrawerTitle>Notice Image Attachment Viewer</DrawerTitle>
                    </DrawerHeader>
                </VisuallyHidden>

                {/* Custom Gradient Header with Close Button */}
                <div className="absolute top-0 left-0 right-0 z-[60] h-20 bg-gradient-to-b from-black/60 to-transparent flex items-start justify-end p-5 pointer-events-none">
                    <DrawerClose asChild>
                        <button className="text-white/80 hover:text-white transition-colors p-2 pointer-events-auto">
                            <X className="h-7 w-7" />
                        </button>
                    </DrawerClose>
                </div>

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
                        <div className="relative w-full h-full max-w-screen max-h-screen flex-center">
                            <Image
                                alt="Full screen image"
                                src={url}
                                fill
                                sizes="100vw"
                                className="object-contain max-w-full max-h-full"
                                priority
                            />
                            {/* Overlay to catch events and prevent default image behavior if needed, 
                  similar to setlist-live-carousel-item.tsx */}
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

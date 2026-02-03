"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import Image from "next/image";
import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";

interface Props {
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
    imageUrls: string[]
}

export function ImageFullScreenDrawer({ isOpen, setIsOpen, imageUrls }: Props) {
    const [enablePan, setEnablePan] = useState(false)
    const imageUrl = imageUrls?.[0]

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent
                className="bg-black border-none p-0 overflow-hidden [&>div:first-child]:hidden"
                style={{ position: 'fixed', inset: 0, marginTop: 0, height: '100dvh', borderRadius: 0 }}
            >
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

                {imageUrl && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <TransformWrapper
                            initialScale={1}
                            minScale={1}
                            maxScale={4}
                            wheel={{ disabled: true }}
                            doubleClick={{ mode: "toggle" }}
                            panning={{ disabled: !enablePan }}
                            centerOnInit={true}
                            onTransformed={(e) => {
                                setEnablePan(e.state.scale > 1.01)
                            }}
                        >
                            <TransformComponent
                                wrapperClass="!w-full !h-full"
                                contentClass="!w-full !h-full !flex !items-center !justify-center"
                            >
                                <Image
                                    alt="Full screen image"
                                    src={imageUrl}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="object-contain"
                                    style={{ width: "auto", height: "auto", maxWidth: "100vw", maxHeight: "100dvh" }}
                                    priority
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    )
}

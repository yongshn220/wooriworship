"use client"

import * as React from "react"
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface Props {
    children: React.ReactNode
    trigger?: React.ReactNode
    title?: string
    description?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
    contentClassName?: string
}

export function ResponsiveDrawer({
    children,
    trigger,
    title,
    description,
    open,
    onOpenChange,
    className,
    contentClassName
}: Props) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent className={cn("h-5/6", className)}>
                <div className="w-full h-full flex flex-col overflow-hidden rounded-t-[10px]">
                    {(title || description) && (
                        <DrawerHeader className="text-left px-4 pt-0 pb-4">
                            {title && <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>}
                            {description && <DrawerDescription>{description}</DrawerDescription>}
                        </DrawerHeader>
                    )}
                    <div className={cn("flex-1 overflow-y-auto scrollbar-hide p-4 pt-0", contentClassName)}>
                        {children}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

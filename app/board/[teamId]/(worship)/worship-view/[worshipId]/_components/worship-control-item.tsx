"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
    icon: ReactNode
    label?: string
    onClick?: () => void
    isActive?: boolean
    variant?: "default" | "toggle" | "button"
    className?: string
}

export function WorshipControlItem({ icon, label, onClick, isActive, variant = "default", className }: Props) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "relative rounded-full transition-all duration-300 w-10 h-10 focus-visible:ring-0 focus-visible:ring-offset-0",
                !isActive && "text-white/60 hover:!bg-transparent hover:!text-white/60",
                isActive && "bg-blue-400 text-white shadow-[inset_0_3px_6px_rgba(0,0,0,0.4)] hover:!bg-blue-400 hover:!text-white",
                className
            )}
            onClick={onClick}
        >
            <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                {icon}
            </motion.div>
            {/* Active Indicator Removed for VisionOS Style */}
        </Button>
    )
}

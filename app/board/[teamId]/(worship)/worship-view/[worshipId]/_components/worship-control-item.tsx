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
                "relative rounded-full transition-all duration-300 w-10 h-10 hover:bg-white/10",
                isActive && "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]",
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
            {isActive && variant === "toggle" && (
                <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"
                />
            )}
        </Button>
    )
}

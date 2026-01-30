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
                "relative rounded-full transition-all duration-300 w-8 h-8 focus-visible:ring-0 focus-visible:ring-offset-0",
                !isActive && "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                isActive && "bg-primary/10 text-primary shadow-sm hover:bg-primary/20 hover:text-primary/90",
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
        </Button>
    )
}

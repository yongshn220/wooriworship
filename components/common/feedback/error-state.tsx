"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface ErrorStateProps {
    title: string;
    description: string;
    image?: "error" | "not-found";
    action?: React.ReactNode;
    fullScreen?: boolean;
    className?: string;
}

export function ErrorState({
    title,
    description,
    image = "error",
    action,
    fullScreen = false,
    className
}: ErrorStateProps) {
    const defaultAction = image === "error" ? (
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reload Page
        </Button>
    ) : (
        <Button onClick={() => window.location.href = "/board"} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Home
        </Button>
    );

    const imgSrc = image === "error"
        ? "/illustration/error-robot.png"
        : "/illustration/not-found-robot.png";

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-6 text-center bg-background",
            fullScreen ? "fixed inset-0 z-50 w-screen h-screen" : "w-full h-full min-h-[400px]",
            className
        )}>
            <div className="relative w-full max-w-[280px] aspect-square mb-8">
                <Image
                    src={imgSrc}
                    alt={title}
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="space-y-3 max-w-md mx-auto">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    {description}
                </p>

                <div className="pt-4 flex justify-center">
                    {action || defaultAction}
                </div>
            </div>
        </div>
    );
}

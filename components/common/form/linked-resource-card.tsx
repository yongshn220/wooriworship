import React from "react";
import { LinkIcon, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface LinkedResourceItem {
    id: string;
    title: string;
    description: string; // e.g. time or date
}

interface LinkedResourceCardProps {
    label: string;
    items: LinkedResourceItem[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onPreview?: (id: string) => void;
    className?: string;
}

export function LinkedResourceCard({
    label,
    items,
    selectedId,
    onSelect,
    onPreview,
    className
}: LinkedResourceCardProps) {
    if (items.length === 0) return null;

    return (
        <div className={cn("bg-card rounded-3xl shadow-xl shadow-foreground/5 border border-border/50 p-6 flex flex-col gap-4", className)}>
            <div className="flex items-center justify-between ml-1">
                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    {label}
                </Label>
                {selectedId && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(null);
                        }}
                    >
                        Unlink
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {items.map(item => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id === selectedId ? null : item.id)}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                            selectedId === item.id
                                ? "bg-primary/5 border-primary shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-200"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                                selectedId === item.id ? "border-primary" : "border-gray-300"
                            )}>
                                {selectedId === item.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("text-sm font-bold transition-colors", selectedId === item.id ? "text-primary" : "text-gray-700")}>
                                    {item.title}
                                </span>
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                            </div>
                        </div>
                        {onPreview && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" onClick={(e) => {
                                e.stopPropagation();
                                onPreview(item.id);
                            }}>
                                <Eye className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

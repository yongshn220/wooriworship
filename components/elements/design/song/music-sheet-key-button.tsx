import { cn } from "@/lib/utils";

interface MusicSheetKeyButtonProps {
  musicKey: string;
  keyNote?: string;
  isSelected: boolean;
  onToggle: () => void;
  orderIndex?: number; // For showing selection order when multiple keys selected
  variant?: "compact" | "default"; // Different styles for different contexts
}

export function MusicSheetKeyButton({
  musicKey,
  keyNote,
  isSelected,
  onToggle,
  orderIndex,
  variant = "default"
}: MusicSheetKeyButtonProps) {
  const isCompact = variant === "compact";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent parent click handlers
        onToggle();
      }}
      className={cn(
        "relative rounded-lg text-sm font-bold border transition-all active:scale-95 flex flex-col items-center justify-center",
        keyNote
          ? isCompact
            ? "h-10 py-1 px-2.5 min-w-[2.5rem]"
            : "h-12 py-1 px-3 min-w-[3rem]"
          : isCompact
          ? "h-8 px-2.5 min-w-[2.5rem]"
          : "h-9 px-3 min-w-[3rem]",
        isCompact
          ? "text-xs rounded-[0.5rem]"
          : "text-sm rounded-lg",
        isSelected
          ? "bg-blue-600 border-blue-600 text-white shadow-md hover:bg-blue-700"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50",
        isCompact && isSelected && "shadow-md ring-0",
        !isCompact && isSelected && "ring-2 ring-blue-600 ring-offset-1"
      )}
    >
      <span>{musicKey}</span>
      {keyNote && (
        <span
          className={cn(
            "font-medium leading-tight truncate",
            isCompact ? "text-[9px] max-w-[70px]" : "text-[10px] max-w-[80px]",
            isSelected ? "text-white/70" : "text-gray-400"
          )}
        >
          {keyNote}
        </span>
      )}
      {isSelected && orderIndex !== undefined && orderIndex >= 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-800 text-white text-[10px] font-bold flex items-center justify-center">
          {orderIndex + 1}
        </span>
      )}
    </button>
  );
}

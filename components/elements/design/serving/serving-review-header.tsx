import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Standardized "Final Review" Header.
 * Used in Serving Form (Step 4) and Serving Board Card (Expanded).
 */
interface ServingReviewHeaderProps {
    date: Date;
    className?: string;
}

export function ServingReviewHeader({ date, className }: ServingReviewHeaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-4 border-b border-border/10 mb-0 mx-auto", className)}>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 opacity-80">Final Review</span>
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                    {format(date, "MMM d")}
                </h2>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide opacity-70">
                    {format(date, "EEEE, yyyy")}
                </p>
            </div>
        </div>
    );
}

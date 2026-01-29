import { cn } from "@/lib/utils";

interface SectionCardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCardContainer({ children, className }: SectionCardContainerProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-sm border border-border overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

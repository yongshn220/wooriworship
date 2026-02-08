
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode
  height: number | string
  className?: string
}

export function BaseTopNavBar({ children, height, className }: Props) {
  return (
    <header
      className={cn(
        "relative z-10 w-full shrink-0 border-b pt-[env(safe-area-inset-top)] static-shell",
        className || "bg-background/80 backdrop-blur-md border-border/20 shadow-sm"
      )}
      style={{ height: typeof height === 'number' ? `calc(${height}px + env(safe-area-inset-top))` : height }}
    >
      {children}
    </header>
  );
}

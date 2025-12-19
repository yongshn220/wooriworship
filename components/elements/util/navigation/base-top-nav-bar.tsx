

import { cn } from "@/lib/utils"; // Assuming utils exists for cn, if not I will just use template literals. But standard projects usually have it. Let me check if I can use it. I'll stick to template literals for safety if I'm not sure, but 'shadcn' was mentioned so `cn` likely exists. I'll just use template strings for now to be safe or check for `clsx`/`tailwind-merge`.
// Actually, let's safely assume I can just append strings.
interface Props {
  children: React.ReactNode
  height: number | string
  className?: string
}

export function BaseTopNavBar({ children, height, className }: Props) {
  return (
    <div className="relative z-50">
      <header
        className={`relative w-full border-b transition-all duration-300 pt-[env(safe-area-inset-top)] static-shell ${className || "bg-white/80 backdrop-blur-md border-white/20 shadow-sm"}`}
        style={{ height: typeof height === 'number' ? `calc(${height}px + env(safe-area-inset-top))` : height }}
      >
        {children}
      </header>
    </div>
  );
}

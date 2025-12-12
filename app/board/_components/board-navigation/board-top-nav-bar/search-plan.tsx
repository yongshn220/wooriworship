import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecoilState } from "recoil";
import { planSearchInputAtom } from "../../../_states/board-states";
import { Button } from "@/components/ui/button";

export function SearchPlan() {
  const [input, setInput] = useRecoilState(planSearchInputAtom)

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3.5 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
      <Input
        className="w-full pl-10 pr-12 h-11 bg-muted/50 border-0 ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded-full shadow-sm placeholder:text-muted-foreground text-base sm:text-sm transition-all hover:bg-background hover:ring-foreground/20 hover:shadow-md focus:bg-background"
        placeholder="Search Plans"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
    </div>
  )
}

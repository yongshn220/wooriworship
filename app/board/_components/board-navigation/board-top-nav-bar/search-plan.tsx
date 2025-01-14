'use client'

import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useRecoilState} from "recoil";
import { planSearchInputAtom } from "../../../_states/board-states";

export function SearchPlan() {
  const [input, setInput] = useRecoilState(planSearchInputAtom)

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
      <Input
        className="w-full pl-9"
        placeholder="Search Plans"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  )
}

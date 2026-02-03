import { useRecoilState } from "recoil";
import { planSearchInputAtom } from "../../../_states/board-states";
import { SearchBar } from "@/components/common/search-bar";

export function SearchPlan() {
  const [input, setInput] = useRecoilState(planSearchInputAtom)

  return (
    <SearchBar
      value={input}
      onChange={setInput}
      placeholder="Search Plans"
      autoFocus
      size="md"
    />
  )
}

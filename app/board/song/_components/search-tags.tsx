import {Badge} from "@/components/ui/badge";


export function SearchTags() {
  return (
    <div className="relative w-ful p-4 space-x-2 space-y-2">
      {
        Array.from(Array(30)).map((_, i) => (
          <Badge key={i} variant="secondary">빠르게</Badge>
        ))
      }
    </div>
  )
}

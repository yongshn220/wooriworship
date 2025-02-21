import type { ReactNode } from "react"
import { Switch } from "@/components/ui/switch"
import {useState} from "react";

interface Props {
  icon: ReactNode
  title: string
  description: string
  toggleId?: string
  onToggle?: (state: boolean) => void
  toggleState?: boolean
}

export function MenuItem({ icon, title, description, toggleId, onToggle, toggleState}: Props) {
  const [isToggled, setIsToggled] = useState(toggleState)

  function handleToggle() {
    const newState = !isToggled
    
    setIsToggled(newState)
    onToggle(newState)
  }

  if (toggleId) {
    return (
      <div className="flex items-center gap-3 p-4 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </div>
        </div>
        <Switch id={toggleId} checked={isToggled} onCheckedChange={handleToggle}/>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-ac cent hover:text-accent-foreground rounded-md transition-colors">
      <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </div>
        </div>
    </div>
  )
}


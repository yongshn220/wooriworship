'use client'

import {Hint} from "@/components/hint";


interface Props {
  name: string;
}

export function TeamIconHint({name}: Props) {
  return (
    <div className="aspect-square relative ">
      <Hint label={name} side="right" align="start" sideOffset={18}>
        <div className="flex-center w-[40px] h-[40px] rounded-md cursor-pointer opacity-75 hover:opacity-100 transition bg-blue-400 text-white text-xl">
          {name[0]?.toUpperCase()}
        </div>
      </Hint>
    </div>
  )
}

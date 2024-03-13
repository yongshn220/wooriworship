'use client'

import {Hint} from "@/components/hint";


interface Props {
  name: string;
}

export function TeamItem({name}: Props) {

  return (
    <div className="aspect-square relative ">
      <Hint label={name} side="right" align="start" sideOffset={18}>
        <div className="flex-center w-full h-full rounded-md cursor-pointer opacity-75 hover:opacity-100 transition bg-orange-500 font-semibold text-xl">
          G
        </div>
      </Hint>
    </div>
  )
}

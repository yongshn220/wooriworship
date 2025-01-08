'use client'


interface Props {
  name: string;
}

export function TeamIcon({name}: Props) {
  return (
    <div className="aspect-square flex-center w-[40px] h-[40px] rounded-md cursor-pointer bg-blue-400 text-white text-xl">
      {name?.toUpperCase()[0]}
    </div>
  )
}

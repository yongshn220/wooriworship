'use client'


interface Props {
  name: string;
}

export function TeamIcon({ name }: Props) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">{name?.toUpperCase()[0]}</div>
  )
}

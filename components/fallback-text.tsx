
interface Props {
  text: string
}

export function FallbackText({text}: Props) {
  return (
    <div className="text-sm text-gray-500">
      {text}
    </div>
  )
}

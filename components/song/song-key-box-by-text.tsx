
export function SongKeyBoxByText({songKey}: {songKey: string}) {

  return (
    <>
      {
        songKey &&
        <div className="flex-center text-xs text-white font-medium bg-gray-400 rounded-sm min-w-5 h-5 p-1">{songKey}</div>
      }
    </>
  )
}

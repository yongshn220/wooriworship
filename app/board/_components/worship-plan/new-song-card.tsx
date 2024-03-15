import {Textarea} from "@/components/ui/textarea";


export function NewSongCard() {
  return (
    <div className="w-full">
      <div className="relative flex-center flex-col w-full h-72 bg-gray-100 rounded-md p-2 gap-4">

        <div className="w-full flex h-28">
          <div
            className="absolute flex-center w-10 h-10 bg-gray-100 rounded-full -translate-y-1/2 -right-4 font-semibold text-sm border-4 border-white">1
          </div>
          <div className="h-full flex-center aspect-square bg-gray-300">
            <p>Score</p>
          </div>
          <div className="flex-1 h-full p-2 px-4">
            <div className="flex-between">
              <p className="font-semibold text-lg">내 주를 가까이 G</p>
              <p className="text-sm">80bpm</p>
            </div>
            <p className="text-sm text-gray-600">Isaiah6tyone</p>
          </div>
        </div>

        <div className="w-full flex-1">
          <Textarea
            className="h-full bg-white"
            placeholder="Write a note for the song."
          />
        </div>

      </div>
      <p className="text-sm text-right text-gray-500 hover:text-gray-700 cursor-pointer">remove</p>
    </div>
  )
}

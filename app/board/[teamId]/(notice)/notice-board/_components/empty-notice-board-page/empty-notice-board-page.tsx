import Image from 'next/image'
import { NewNoticeButton } from './new-notice-button'

export function EmptyNoticeBoardPage() {
  return (
    <div className="w-full h-full flex-center flex-col gap-3 pt-10 bg-gray-50">
      <Image
        alt="compose music image"
        src="/illustration/teamworkIllustration.svg"
        width={300}
        height={300}
      />
      <p className="text-3xl font-semibold">Notice is empty</p>
      <p className="text-gray-500">Click &ldquo;Add Notice&rdquo; button to get started</p>
      <NewNoticeButton/>
    </div>
  )
}

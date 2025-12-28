import Image from 'next/image'
import { NewNoticeButton } from './new-notice-button'

export function EmptyNoticeBoardPage() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <Image
        alt="Empty notice board"
        src="/illustration/empty-notice-plan-v6.png"
        width={300}
        height={300}
        className="mb-2"
        priority
      />
      <div className="space-y-2 max-w-sm">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Notice Board is empty</h3>
        <p className="text-muted-foreground text-sm">
          Click &ldquo;Add Notice&rdquo; button to keep your team informed with the latest updates.
        </p>
      </div>
      <div className="pt-2">
        <NewNoticeButton />
      </div>
    </div>
  )
}

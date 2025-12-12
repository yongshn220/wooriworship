import Image from 'next/image'
import { NewNoticeButton } from './new-notice-button'

export function EmptyNoticeBoardPage() {
  return (
    <div className="w-full h-full flex-center flex-col gap-3 pt-10 bg-background">
      <Image
        alt="compose music image"
        src="/illustration/teamworkIllustration.svg"
        width={300}
        height={300}
      />
      <p className="text-3xl font-bold tracking-tight text-foreground">Notice is empty</p>
      <p className="text-muted-foreground">Click &ldquo;Add Notice&rdquo; button to get started</p>
      <NewNoticeButton />
    </div>
  )
}

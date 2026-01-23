import { useRecoilValue } from "recoil";
import { noticeAtom } from "@/global-states/notice-state";
import { getTimePassedFromTimestampShorten, timestampToDateStringFormatted } from "@/components/util/helper/helper-functions";
import { userAtom } from "@/global-states/userState";
import Image from 'next/image'
import { NoticeHeaderMenu } from "@/components/elements/design/notice/notice-header/parts/notice-header-menu";
import React, { useState } from "react";
import { ImageFullScreenDrawer } from "@/components/elements/drawer/image-full-screen/image-full-screen-drawer";
import { Linkify } from "@/components/elements/util/text/linkify";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { BoardCard } from "@/components/common/board/board-card";


interface Props {
  noticeId: string
}

export function NoticeHeaderDefault({ noticeId }: Props) {
  const [fullScreenOn, setFullScreenOn] = useState({
    state: false,
    urls: []
  })
  const [isExpanded, setIsExpanded] = useState(false);

  const notice = useRecoilValue(noticeAtom(noticeId))
  const user = useRecoilValue(userAtom(notice?.created_by.id))

  const hasFiles = notice?.file_urls && notice.file_urls.length > 0;

  return (
    <div className="w-full">
      <ImageFullScreenDrawer isOpen={fullScreenOn.state} setIsOpen={(state: boolean) => setFullScreenOn((prev: any) => ({ ...prev, state: state }))} imageUrls={fullScreenOn.urls} />

      <BoardCard
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(prev => !prev)}
        onCollapse={(e) => {
          e.stopPropagation();
          setIsExpanded(false);
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col w-full pr-4">
              {/* Title */}
              {/* Title */}
              <h3 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug tracking-tight">
                {notice?.title}

              </h3>

              {/* Meta Info */}
              <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground mt-2 font-medium">
                <span className="text-foreground font-semibold">{user?.name}</span>
                <span className="w-1 h-1 bg-muted rounded-full"></span>
                <span>{timestampToDateStringFormatted(notice?.created_by?.time)}</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {getTimePassedFromTimestampShorten(notice?.created_by?.time)}
                </span>
              </div>
            </div>

            {/* Menu */}
            <div className="shrink-0 -mt-1 -mr-2" onClick={(e) => e.stopPropagation()}>
              <NoticeHeaderMenu noticeId={noticeId} createdById={notice?.created_by.id || ""} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <p className="text-muted-foreground line-clamp-2 leading-relaxed text-sm sm:text-base">
                  {notice?.body}
                </p>
                {hasFiles && (
                  <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-muted/30 rounded-full text-xs font-medium text-muted-foreground border border-border/50">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>{notice.file_urls.length} attachments</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="whitespace-pre-line break-all text-base sm:text-lg text-foreground leading-8 space-y-4">
                  <Linkify>
                    {notice?.body || ""}
                  </Linkify>
                </div>

                {/* Images */}
                {hasFiles && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="flex flex-wrap gap-3">
                      {notice.file_urls.map((url, index) => (
                        <div
                          key={index}
                          className="cursor-pointer w-32 h-32 relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                          onClick={() => setFullScreenOn({ state: true, urls: [url] })}>
                          <Image
                            alt="notice uploaded image"
                            src={url}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BoardCard>
    </div>
  );
}


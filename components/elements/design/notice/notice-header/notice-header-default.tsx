import { useRecoilValue } from "recoil";
import { noticeAtom } from "@/global-states/notice-state";
import { getTimePassedFromTimestampShorten, timestampToDateStringFormatted } from "@/components/util/helper/helper-functions";
import { userAtom } from "@/global-states/userState";
import Image from 'next/image'
import { NoticeHeaderMenu } from "@/components/elements/design/notice/notice-header/parts/notice-header-menu";
import React, { useState } from "react";
import { ImageFullScreenDialog } from "@/components/elements/dialog/image-full-screen/image-full-screen-dialog";
import { Linkify } from "@/components/elements/util/text/linkify";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";


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
      <ImageFullScreenDialog isOpen={fullScreenOn.state} setIsOpen={(state: boolean) => setFullScreenOn((prev: any) => ({ ...prev, state: state }))} imageUrls={fullScreenOn.urls} />

      <div
        className="w-full p-4 border rounded-lg bg-white relative transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-gray-50/50"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1 pr-2">
            <h3 className="font-semibold text-base sm:text-lg leading-tight">{notice?.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{user?.name}</span>
              <span>•</span>
              <span>{timestampToDateStringFormatted(notice?.created_by?.time)}</span>
              <span className="bg-gray-100 px-1.5 rounded-sm text-gray-400">
                {getTimePassedFromTimestampShorten(notice?.created_by?.time)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <NoticeHeaderMenu noticeId={noticeId} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-gray-600 text-sm"
            >
              <p className="line-clamp-2">
                {notice?.body}
              </p>
              {hasFiles && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 font-medium">
                  <ImageIcon className="h-3 w-3" />
                  <span>{notice.file_urls.length} images attached</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
              onClick={(e) => e.stopPropagation()} // Allow text selection/interaction
            >
              <div className="whitespace-pre-line break-all text-sm sm:text-base text-gray-800 border-t pt-2">
                <Linkify>
                  {notice?.body || ""}
                </Linkify>
              </div>

              {/* Images */}
              {hasFiles && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {notice.file_urls.map((url, index) => (
                      <div
                        key={index}
                        className="cursor-pointer w-24 h-24 relative hover:opacity-90 transition-opacity"
                        onClick={() => setFullScreenOn({ state: true, urls: [url] })}>
                        <Image
                          alt="notice uploaded image"
                          src={url}
                          fill
                          className="object-cover rounded-lg border border-gray-100"
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
    </div>
  )
}

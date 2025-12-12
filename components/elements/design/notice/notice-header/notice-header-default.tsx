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
import { ImageIcon, ChevronUp } from "lucide-react";


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
        className="w-full bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group relative hover:-translate-y-[1px]"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col w-full pr-4">
            {/* Title */}
            {/* Title */}
            <h3 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug tracking-tight">
              {notice?.title}
              {isExpanded && (
                <ChevronUp className="h-6 w-6 text-gray-400 animate-in fade-in zoom-in duration-300" />
              )}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center flex-wrap gap-3 text-sm text-gray-400 mt-2 font-medium">
              <span className="text-gray-700 font-semibold">{user?.name}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
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
              <p className="text-gray-500 line-clamp-2 leading-relaxed text-sm sm:text-base">
                {notice?.body}
              </p>
              {hasFiles && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-500 border border-gray-100">
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
              <div className="whitespace-pre-line break-all text-base sm:text-lg text-gray-800 leading-8 space-y-4">
                <Linkify>
                  {notice?.body || ""}
                </Linkify>
              </div>

              {/* Images */}
              {hasFiles && (
                <div className="mt-6 pt-6 border-t border-gray-100">
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
    </div>
  );
}


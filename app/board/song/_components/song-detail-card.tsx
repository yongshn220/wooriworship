'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";


interface Props {
  isOpen: boolean
  setIsOpen: any
}

export function SongDetailCard({isOpen, setIsOpen}: Props) {

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] h-5/6 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">내 주를 가까이</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex-between items-center">
            <Label htmlFor="name" className="text-base font-semibold">
              Version / Team
            </Label>
            <p>Isaiash6tyOne</p>
          </div>
          <div className="flex-between items-center">
            <Label htmlFor="name" className="text-base font-semibold">
              Link
            </Label>
            <p className="text-blue-500 hover:text-blue-600 cursor-pointer">https://youtube.com/watch?id=UV1S34KJ</p>
          </div>
          <div className="flex-between items-center">
            <Label htmlFor="name" className="text-base font-semibold">
              Tags
            </Label>
            <div className="w-full text-right space-x-2 pl-20">
              {
                ["빠른", "신나는", "엔딩곡", "빠른", "재밌는", "영어", "신나는", "엔딩곡", "신나는", "엔딩곡", "빠른", "재밌는", "영어"].map((tag, i) => (
                   <Badge key={i} variant="outline">{tag}</Badge>
                ))
              }
            </div>
          </div>
          <div className="flex-start flex-col items-center gap-1.5 mt-4">
            <Label htmlFor="name" className="text-base font-semibold">
              Music Sheets
            </Label>
            <div className="flex-center w-full h-60 aspect-square border-2 p-2 rounded-md shadow-sm">
              <div className="flex-center w-full h-full gap-4 overflow-x-scroll scrollbar-hide">
                <div className="flex flex-col h-full aspect-[3/4]">
                  <div className="flex-1 bg-gray-100"/>
                  <p className="text-center text-sm text-gray-500">1</p>
                </div>

                <div className="flex flex-col h-full aspect-[3/4]">
                  <div className="flex-1 bg-gray-100"/>
                  <p className="text-center text-sm text-gray-500">2</p>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

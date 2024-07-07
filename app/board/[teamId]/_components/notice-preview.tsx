import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";


export function NoticePreview() {
  return (
    <div className="bg-white border p-4 rounded-xl">
      <p className="text-xl font-semibold pb-4">Notice</p>
      <div className="w-full py-2">
        <div className="flex-between">
          <p className="font-semibold">이번주 공지입니다. (Test)</p>
          <p className="text-sm text-gray-500">2 days ago</p>
        </div>
        <p className="py-4">안녕하세요, 여러분! 다가오는 7월 10일, 저희 회사에서 여름 맞이 대청소 및 사무실 정리 행사가 있을 예정입니다. 모든 직원분들께서는 아래 일정을 참고하시어
          행사에 참여해주시기 바랍니다.</p>
        <Separator className="mt-2"/>
      </div>
      <div className="w-full py-2">
        <div className="flex-between">
          <p className="font-semibold">이번주 공지입니다. (Test)</p>
          <p className="text-sm text-gray-500">2 days ago</p>
        </div>
        <p className="py-4">안녕하세요, 여러분! 다가오는 7월 10일, 저희 회사에서 여름 맞이 대청소 및 사무실 정리 행사가 있을 예정입니다. 모든 직원분들께서는 아래 일정을 참고하시어
          행사에 참여해주시기 바랍니다.</p>
        <Separator className="mt-2"/>
      </div>
      <div className="w-full flex-center">
        <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-none">View All</Button>
      </div>
    </div>
  )
}

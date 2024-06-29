import Lottie from "lottie-react";
import loadingAnimation from "@/public/animation/loadingCircle.json"

export function LoadingCircle() {
  return (
    <div className="w-full h-full flex-center">
      <Lottie animationData={loadingAnimation} loop={true} className="w-[100px] h-[100px]"/>
    </div>
  )
}

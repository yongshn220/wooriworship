import Lottie from "lottie-react";
import routingAnimation from "@/public/animation/routing.json"

export function RoutingIndicator() {
  return (
    <div className="flex-center">
      <Lottie animationData={routingAnimation} loop={true} className="w-80 h-80"/>
    </div>
  )
}

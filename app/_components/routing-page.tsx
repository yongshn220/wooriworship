
import {RoutingIndicator} from "@/components/animation/routing-indicator";
import {MainLogo} from "@/components/logo/main-logo";


export function RoutingPage() {
  return (
    <div className="absolute flex-center w-full h-full">
      <div className="absolute bottom-10">
        <MainLogo/>
      </div>
      <RoutingIndicator/>
    </div>
  )
}

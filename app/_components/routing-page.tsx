
import {RoutingIndicator} from "@/components/util/animation/routing-indicator";
import {MainLogo} from "@/components/elements/util/logo/main-logo";


export function RoutingPage() {
  return (
    <div className="flex-center w-full h-screen bg-white">
      <RoutingIndicator/>
      <div className="absolute bottom-10">
        <MainLogo/>
      </div>
    </div>
  )
}

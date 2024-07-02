import {usePathname, useSearchParams} from "next/navigation";
import {useEffect} from "react";

export function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("scoll effect")
    const currentPath = pathname + searchParams.toString();
    const scrollPositions = JSON.parse(localStorage.getItem('scrollPositions') || '{}');

    // Restore scroll position
    if (scrollPositions[currentPath]) {
      setTimeout(() => {
        window.scrollTo(0, scrollPositions[currentPath]);
        console.log(scrollPositions[currentPath])
      }, 0);
    }

    // Save scroll position before unmounting
    return () => {
      console.log("scoll end", window.scrollY)
      scrollPositions[currentPath] = window.scrollY;
      localStorage.setItem('scrollPositions', JSON.stringify(scrollPositions));
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

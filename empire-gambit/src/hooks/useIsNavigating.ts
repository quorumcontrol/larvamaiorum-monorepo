import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const useIsNavigating = () => {
    const router = useRouter();
    const [navigating, setNavigating] = useState(false);
  
    useEffect(() => {
      const handleStart = (url: string) =>
        url !== router.asPath && setNavigating(true);
      const handleComplete = (url: string) =>
        url === router.asPath && setNavigating(false);
  
      router.events.on("routeChangeStart", handleStart);
      router.events.on("routeChangeComplete", handleComplete);
      router.events.on("routeChangeError", handleComplete);
  
      return () => {
        router.events.off("routeChangeStart", handleStart);
        router.events.off("routeChangeComplete", handleComplete);
        router.events.off("routeChangeError", handleComplete);
      };
    }, [router]);

    return navigating
}


import { useEffect, useState } from "react";

const useIsClientSide = () => {
  const [domLoaded, setDomLoaded] = useState(false);
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return domLoaded
}

export default useIsClientSide

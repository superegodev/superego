import { type ReactNode, useEffect, useState } from "react";
import getScreenSize, {
  mediumScreenQuery,
  smallScreenQuery,
} from "./getScreenSize.js";
import ScreenSizeContext from "./ScreenSizeContext.js";

interface Props {
  children: ReactNode;
}
export default function ScreenSizeProvider({ children }: Props) {
  const [screenSize, setScreenSize] = useState(getScreenSize);

  useEffect(() => {
    const smallScreenMQL = window.matchMedia(smallScreenQuery);
    const onSmallScreenMQLChange = () => setScreenSize(getScreenSize());
    smallScreenMQL.addEventListener("change", onSmallScreenMQLChange);

    const mediumScreenMQL = window.matchMedia(mediumScreenQuery);
    const onMediumScreenMQLChange = () => setScreenSize(getScreenSize());
    mediumScreenMQL.addEventListener("change", onMediumScreenMQLChange);

    return () => {
      smallScreenMQL.removeEventListener("change", onSmallScreenMQLChange);
      mediumScreenMQL.removeEventListener("change", onMediumScreenMQLChange);
    };
  }, []);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  );
}

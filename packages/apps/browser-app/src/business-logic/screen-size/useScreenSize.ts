import { useEffect, useState } from "react";
import { breakpoints } from "../../themes.css.js";
import ScreenSize from "./ScreenSize.js";

const smallScreenQuery = `(max-width: ${breakpoints.small})`;
const mediumScreenQuery = `(max-width: ${breakpoints.medium})`;

function getScreenSize(): ScreenSize {
  return window.matchMedia(smallScreenQuery).matches
    ? ScreenSize.Small
    : window.matchMedia(mediumScreenQuery).matches
      ? ScreenSize.Medium
      : ScreenSize.Large;
}

export default function useScreenSize(): ScreenSize {
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

  return screenSize;
}

import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import Logo from "../../design-system/Logo/Logo.jsx";
import * as cs from "./RHFAppVersionFilesField.css.js";

const totalDots = 3;
const resetDotsTickCount = totalDots + 2;

export default function ImplementingSpinner() {
  const intl = useIntl();

  const sentences = useMemo(
    () => [
      intl.formatMessage({ defaultMessage: "Let me work on that" }),
      intl.formatMessage({ defaultMessage: "It'll be done in no time" }),
      intl.formatMessage({ defaultMessage: "Making changes" }),
      intl.formatMessage({ defaultMessage: "Compiling code" }),
      intl.formatMessage({ defaultMessage: "One more fix" }),
      intl.formatMessage({
        defaultMessage: "It’s more complex than I estimated",
      }),
      intl.formatMessage({ defaultMessage: "Almost there" }),
      intl.formatMessage({ defaultMessage: "Please don't fire me" }),
      intl.formatMessage({ defaultMessage: "It’s a hard problem" }),
      intl.formatMessage({ defaultMessage: "Just a little refactor" }),
    ],
    [intl],
  );

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [dotsCount, setDotsCount] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotsCount((dotsCount) => (dotsCount + 1) % resetDotsTickCount);
      setSentenceIndex((sentenceIndex) =>
        sentenceIndex < (sentences.length - 1) * resetDotsTickCount
          ? sentenceIndex + 1
          : (sentences.length - 1) * resetDotsTickCount,
      );
    }, 800);
    return () => clearInterval(intervalId);
  }, [sentences]);

  return (
    <div className={cs.ImplementingSpinner.root}>
      <Logo variant="spinner" className={cs.ImplementingSpinner.logo} />
      <div
        className={
          sentenceIndex % resetDotsTickCount === 0
            ? cs.ImplementingSpinner.sentence.appearing
            : sentenceIndex % resetDotsTickCount === resetDotsTickCount - 1
              ? cs.ImplementingSpinner.sentence.disappearing
              : undefined
        }
      >
        {sentences[Math.floor(sentenceIndex / resetDotsTickCount)]}
        <span style={{ visibility: dotsCount > 0 ? "visible" : "hidden" }}>
          {"."}
        </span>
        <span style={{ visibility: dotsCount > 1 ? "visible" : "hidden" }}>
          {"."}
        </span>
        <span style={{ visibility: dotsCount > 2 ? "visible" : "hidden" }}>
          {"."}
        </span>
      </div>
    </div>
  );
}

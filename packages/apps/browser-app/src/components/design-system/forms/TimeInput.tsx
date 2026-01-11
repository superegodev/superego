import { DateInput, DateSegment } from "react-aria-components";
import type { RefCallBack } from "react-hook-form";
import * as cs from "./forms.css.js";

interface Props {
  ref: RefCallBack;
}
export default function TimeInput({ ref }: Props) {
  return (
    <DateInput className={cs.TimeInput.root}>
      {(segment) => (
        <DateSegment
          ref={segment.type === "hour" ? ref : undefined}
          segment={segment}
          className={cs.TimeInput.segment}
        />
      )}
    </DateInput>
  );
}

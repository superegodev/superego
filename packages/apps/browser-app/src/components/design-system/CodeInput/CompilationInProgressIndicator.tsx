import { FormattedMessage } from "react-intl";
import * as cs from "./CodeInput.css.js";

interface Props {
  isVisible: boolean;
}
export default function CompilationInProgressIndicator({ isVisible }: Props) {
  return (
    <div
      className={
        cs.CompilationInProgressIndicator.root[isVisible ? "visible" : "hidden"]
      }
    >
      <FormattedMessage defaultMessage={"Compiling..."} />
    </div>
  );
}

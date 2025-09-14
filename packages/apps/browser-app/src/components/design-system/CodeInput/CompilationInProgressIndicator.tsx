import { FormattedMessage } from "react-intl";
import * as cs from "./CodeInput.css.js";

export default function CompilationInProgressIndicator() {
  return (
    <div className={cs.CompilationInProgressIndicator.root}>
      <FormattedMessage defaultMessage={"Compiling..."} />
    </div>
  );
}

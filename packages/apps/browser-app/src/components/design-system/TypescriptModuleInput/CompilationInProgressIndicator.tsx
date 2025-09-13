import { FormattedMessage } from "react-intl";
import * as cs from "./TypescriptModuleInput.css.js";

interface Props {
  isShown: boolean;
}
export default function CompilationInProgressIndicator({ isShown }: Props) {
  return isShown ? (
    <div className={cs.CompilationInProgressIndicator.root}>
      <FormattedMessage defaultMessage={"Compiling..."} />
    </div>
  ) : null;
}

import ThreeDotSpinner from "../../design-system/ThreeDotSpinner/ThreeDotSpinner.js";
import * as cs from "./ConversationMessages.css.js";

export default function ThinkingMessage() {
  return (
    <div className={cs.ThinkingMessage.root}>
      <ThreeDotSpinner className={cs.ThinkingMessage.spinner} />
    </div>
  );
}

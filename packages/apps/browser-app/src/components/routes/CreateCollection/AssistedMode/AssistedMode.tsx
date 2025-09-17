import { useIntl } from "react-intl";
import { useStartConversation } from "../../../../business-logic/backend/hooks.js";
import Logo from "../../../design-system/Logo/Logo.js";
import UserMessageContentInput from "../../../widgets/UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./AssistedMode.css.js";

export default function AssistedMode() {
  const intl = useIntl();
  const startConversation = useStartConversation();
  const conversation = startConversation.result?.data ?? null;
  const handleSend = () => {};
  const isSending = startConversation.isPending;
  return (
    <div className={cs.AssistedMode.root}>
      <Logo className={cs.AssistedMode.logo} />
      <UserMessageContentInput
        conversation={conversation}
        onSend={handleSend}
        isSending={isSending}
        placeholder={intl.formatMessage({
          defaultMessage: "What kind of data do you want to store?",
        })}
        autoFocus={true}
      />
    </div>
  );
}

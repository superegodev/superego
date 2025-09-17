import { useIntl } from "react-intl";
import { useStartConversation } from "../../../business-logic/backend/hooks.js";
import Logo from "../../design-system/Logo/Logo.js";
import UserMessageContentInput from "../../widgets/UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./CreateCollectionAssisted.css.js";

export default function CreateCollectionAssisted() {
  const intl = useIntl();
  const startConversation = useStartConversation();
  const conversation = startConversation.result?.data ?? null;
  const handleSend = () => {};
  const isSending = startConversation.isPending;
  return (
    <div className={cs.CreateCollectionAssisted.root}>
      <Logo className={cs.CreateCollectionAssisted.logo} />
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

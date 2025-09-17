import {
  AssistantName,
  ConversationFormat,
  type Message,
} from "@superego/backend";
import { PiCode } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useStartConversation } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Alert from "../../design-system/Alert/Alert.js";
import ResultError from "../../design-system/ResultError/ResultError.js";
import Shell from "../../design-system/Shell/Shell.js";
import UserMessageContentInput from "../../widgets/UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./CreateCollectionAssisted.css.js";
import Hero from "./Hero.js";

export default function CreateCollectionAssisted() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate, isPending } = useStartConversation();
  const onSend = async (userMessageContent: Message.User["content"]) => {
    const { success, data } = await mutate(
      AssistantName.CollectionCreator,
      ConversationFormat.Text,
      userMessageContent,
    );
    if (success) {
      navigateTo({
        name: RouteName.CollectionCreatorConversation,
        conversationId: data.id,
      });
    }
  };
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({
          defaultMessage: "Create Collection (Assisted Mode)",
        })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Create collection actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Go to manual mode" }),
            icon: <PiCode />,
            to: { name: RouteName.CreateCollectionManual },
          },
        ]}
      />
      <Shell.Panel.Content className={cs.CreateCollectionAssisted.panelContent}>
        <Hero />
        <UserMessageContentInput
          conversation={null}
          onSend={onSend}
          isSending={isPending}
          placeholder={intl.formatMessage({
            defaultMessage: "What kind of data do you want to store?",
          })}
          autoFocus={true}
        />
        {result?.error ? (
          <Alert
            variant="error"
            title={intl.formatMessage({
              defaultMessage: "Error starting conversation",
            })}
          >
            <ResultError error={result.error} />
          </Alert>
        ) : null}
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

import {
  type App,
  type Collection,
  type Message,
  MessageContentPartType,
} from "@superego/backend";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import findIncompatibilities, {
  type Incompatibility,
} from "./findIncompatibilities.js";
import * as cs from "./RHFAppVersionFilesField.css.js";

interface Props {
  app: App;
  targetCollections: Collection[];
  onResolveWithAssistant: (messageContent: Message.User["content"]) => void;
}
export default function ResolveIncompatibilityModal({
  app,
  targetCollections,
  onResolveWithAssistant,
}: Props) {
  const incompatibilities = findIncompatibilities(app, targetCollections);

  const [isOpen, setIsOpen] = useState(incompatibilities !== null);

  return incompatibilities ? (
    <ModalDialog
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={() => setIsOpen(false)}
    >
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Resolve incompatibility" />
      </ModalDialog.Heading>
      <FormattedMessage
        defaultMessage={`
          <p>
            The collections used by this app have changed since the app was
            created. Update the app to ensure that it works correctly.
          </p>
          <p>Collection changes:</p>
        `}
        values={formattedMessageHtmlTags}
      />
      <ul>
        {incompatibilities.map((incompatibility) => (
          <li key={incompatibility.id}>
            <FormattedMessage
              defaultMessage={`
                {type, select,
                  WasDeleted {<code>{collectionId}</code> was deleted.}
                  other {<code>{collectionId}</code> has a new version.}
                }
              `}
              values={{
                collectionId: incompatibility.id,
                type: incompatibility.type,
                ...formattedMessageHtmlTags,
              }}
            />
          </li>
        ))}
      </ul>
      <div className={cs.ResolveIncompatibilityModal.buttons}>
        <Button
          variant="primary"
          onPress={() => {
            onResolveWithAssistant([
              {
                type: MessageContentPartType.Text,
                text: getUserRequest(incompatibilities),
              },
            ]);
            setIsOpen(false);
          }}
        >
          <FormattedMessage defaultMessage="Ask the assistant" />
        </Button>
        <Button slot="close">
          <FormattedMessage defaultMessage="I'll do it myself" />
        </Button>
      </div>
    </ModalDialog>
  ) : null;
}

function getUserRequest(incompatibilities: Incompatibility[]): string {
  return `
The collections used by this app have changed since the app was created. Update
the app to ensure that it works correctly.

Changes:
${incompatibilities
  .map((incompatibility) =>
    incompatibility.type === "WasDeleted"
      ? `- ${incompatibility.id} was deleted.`
      : `- ${incompatibility.id} has new version ${incompatibility.latestVersionId}.`,
  )
  .join("\n")}

Guidelines to update the app:
- For each deleted collection: remove all app elements that require it.
- For each collection with a new version: check that the app only uses
  properties that exist in the new versions and that the properties are of the
  correct type (refer to the collection TypeScript schema). For each mismatching
  property:
  - If it doesn't exist anymore:
    - If there's a suitable replacement, use the replacement instead.
    - Else, remove app elements that require it.
  - If a property changed type, update it accordingly.

Do NOT erase the USER REQUEST HISTORY with this update. Just add another entry
to it.
  `.trim();
}

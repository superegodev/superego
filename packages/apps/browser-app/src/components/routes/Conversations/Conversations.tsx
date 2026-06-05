import { RouteName } from "@superego/routing";
import { PiPlus } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { listConversationsQuery } from "../../../business-logic/backend/hooks.js";
import Shell from "../../design-system/Shell/Shell.js";
import ConversationsTable from "../../widgets/ConversationsTable/ConversationsTable.js";

export default function Conversations() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({
          // TODO(formatjs): Remove explicit ID when https://github.com/formatjs/formatjs/issues/6735 is fixed.
          id: "Conversations.tsx_2U3CJ+",
          defaultMessage: "🤖\u2002Conversations",
        })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Conversations actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "New conversation" }),
            icon: <PiPlus />,
            to: {
              name: RouteName.Ask,
            },
          },
        ]}
      />
      <Shell.Panel.Content fullWidth={true}>
        <DataLoader queries={[listConversationsQuery([])]}>
          {(conversations) => (
            <ConversationsTable conversations={conversations} pageSize="max" />
          )}
        </DataLoader>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

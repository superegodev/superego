import { PiRobot } from "react-icons/pi";
import { useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateCollectionForm from "./CreateCollectionForm/CreateCollectionForm.js";

export default function CreateCollectionManual() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({
          defaultMessage: "Create Collection (Manual)",
        })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Create collection actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Use assistant" }),
            icon: <PiRobot />,
            to: { name: RouteName.CreateCollectionAssisted },
          },
        ]}
      />
      <Shell.Panel.Content>
        <CreateCollectionForm />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

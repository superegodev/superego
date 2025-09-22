import { useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import Logo from "../../design-system/Logo/Logo.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateCollectionForm from "./CreateCollectionForm/CreateCollectionForm.js";
import * as cs from "./CreateCollectionManual.css.js";

export default function CreateCollectionManual() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({
          defaultMessage: "Create Collection (Manual Mode)",
        })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Create collection actions",
        })}
        actions={[
          {
            label: intl.formatMessage({
              defaultMessage: "Go to assisted mode",
            }),
            icon: (
              <Logo
                variant="pixel-art"
                className={cs.CreateCollectionManual.assistedModeIcon}
              />
            ),
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

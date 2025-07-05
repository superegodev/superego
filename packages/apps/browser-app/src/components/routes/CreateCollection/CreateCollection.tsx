import { useIntl } from "react-intl";
import Shell from "../../design-system/Shell/Shell.js";
import CreateCollectionForm from "./CreateCollectionForm.js";

export default function CreateCollection() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Create Collection" })}
      />
      <Shell.Panel.Content>
        <CreateCollectionForm />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

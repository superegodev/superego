import { AssistantName, type GlobalSettings } from "@superego/backend";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.jsx";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function AssistantsSettings({ control }: Props) {
  const intl = useIntl();
  return (
    <>
      <RHFTextField
        control={control}
        name={`assistants.developerPrompts.${AssistantName.Factotum}`}
        emptyInputValue={null}
        textArea={true}
        label={intl.formatMessage({
          defaultMessage: "Factotum developer prompt",
        })}
      />
      <RHFTextField
        control={control}
        name={`assistants.developerPrompts.${AssistantName.CollectionManager}`}
        emptyInputValue={null}
        textArea={true}
        label={intl.formatMessage({
          defaultMessage: "Collection manager developer prompt",
        })}
      />
    </>
  );
}

import {
  AssistantName,
  type DeveloperPrompts,
  type GlobalSettings,
} from "@superego/backend";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  developerPrompts: DeveloperPrompts;
}
export default function AssistantsSettings({
  control,
  developerPrompts,
}: Props) {
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
        placeholder={developerPrompts[AssistantName.Factotum]}
      />
      <RHFTextField
        control={control}
        name={`assistants.developerPrompts.${AssistantName.CollectionManager}`}
        emptyInputValue={null}
        textArea={true}
        label={intl.formatMessage({
          defaultMessage: "Collection manager developer prompt",
        })}
        placeholder={developerPrompts[AssistantName.CollectionManager]}
      />
    </>
  );
}

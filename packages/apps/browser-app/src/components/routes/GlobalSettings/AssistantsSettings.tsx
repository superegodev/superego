import {
  AssistantName,
  type DeveloperPrompts,
  type GlobalSettings,
} from "@superego/backend";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import { Fields } from "../../design-system/forms/forms.js";
import RHFMarkdownField from "../../widgets/RHFMarkdownField/RHFMarkdownField.js";
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
    <Fields>
      <RHFTextField
        control={control}
        name="assistants.userName"
        emptyInputValue={null}
        label={intl.formatMessage({ defaultMessage: "Your name" })}
        placeholder="Alex"
      />
      <RHFMarkdownField
        control={control}
        name={`assistants.developerPrompts.${AssistantName.Factotum}`}
        emptyInputValue={null}
        showToolbar={false}
        label={intl.formatMessage({
          defaultMessage: "Factotum developer prompt",
        })}
        placeholder={developerPrompts[AssistantName.Factotum]}
      />
      <RHFMarkdownField
        control={control}
        name={`assistants.developerPrompts.${AssistantName.CollectionCreator}`}
        emptyInputValue={null}
        showToolbar={false}
        label={intl.formatMessage({
          defaultMessage: "Collection Creator developer prompt",
        })}
        placeholder={developerPrompts[AssistantName.CollectionCreator]}
      />
    </Fields>
  );
}

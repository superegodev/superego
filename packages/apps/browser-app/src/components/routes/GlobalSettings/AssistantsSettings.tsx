import {
  AssistantName,
  type DeveloperPrompts,
  type GlobalSettings,
} from "@superego/backend";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import { Fields } from "../../design-system/forms/forms.js";
import RHFMarkdownField from "../../widgets/RHFMarkdownField/RHFMarkdownField.js";

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
      <RHFMarkdownField
        control={control}
        name="assistants.userInfo"
        emptyInputValue={null}
        showToolbar={false}
        label={intl.formatMessage({ defaultMessage: "About you" })}
        placeholder={intl.formatMessage({
          defaultMessage: "Name: Sigmund. Born: May 6, 1856",
        })}
      />
      <RHFMarkdownField
        control={control}
        name="assistants.userPreferences"
        emptyInputValue={null}
        showToolbar={false}
        label={intl.formatMessage({ defaultMessage: "Your preferences" })}
        placeholder={intl.formatMessage({
          defaultMessage:
            "Always reply in German. Use informal tone. Use metric units.",
        })}
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

import type { GlobalSettings } from "@superego/backend";
import { useEffect, useRef } from "react";
import { type Control, type UseFormTrigger, useWatch } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import ProviderModelRefUtils from "../../../../../utils/ProviderModelRefUtils.js";
import Fieldset from "../../../../design-system/Fieldset/Fieldset.js";
import type { Option } from "../../../../design-system/forms/forms.js";
import ModelSelect from "./ModelSelect.js";
import ReasoningEffortSelect from "./ReasoningEffortSelect.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
  triggerValidation: UseFormTrigger<GlobalSettings>;
}
export default function DefaultInferenceOptions({
  control,
  triggerValidation,
}: Props) {
  const intl = useIntl();

  const providers = useWatch({ control, name: "inference.providers" });

  // Re-validate default inference options when providers change, since
  // their validity depends on provider model capabilities.
  const previousProvidersRef = useRef(providers);
  useEffect(() => {
    // Skips triggering on first render.
    if (previousProvidersRef.current !== providers) {
      previousProvidersRef.current = providers;
      triggerValidation("inference.defaultInferenceOptions");
    }
  }, [providers, triggerValidation]);

  const modelOptions: Option[] = providers.flatMap((provider) =>
    provider.models.map((model) => ({
      id: ProviderModelRefUtils.toString({
        providerName: provider.name,
        modelId: model.id,
      }),
      label: model.name,
      description: provider.name,
    })),
  );

  // ModelSelect and ReasoningEffortSelect control the whole
  // inference.defaultInferenceOptions.{section} object (not just their specific
  // field) because the section value can be null. If we rendered (and therefore
  // registered) a field while its parent section is null, react-hook-form would
  // show validation errors.
  return (
    <>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Default completion options" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <ModelSelect
            control={control}
            name="inference.defaultInferenceOptions.completion"
            label={intl.formatMessage({ defaultMessage: "Model" })}
            modelOptions={modelOptions}
          />
          <ReasoningEffortSelect
            control={control}
            name="inference.defaultInferenceOptions.completion"
            label={intl.formatMessage({ defaultMessage: "Reasoning effort" })}
          />
        </Fieldset.Fields>
      </Fieldset>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Default transcription options" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <ModelSelect
            control={control}
            name="inference.defaultInferenceOptions.transcription"
            label={intl.formatMessage({ defaultMessage: "Model" })}
            modelOptions={modelOptions}
          />
        </Fieldset.Fields>
      </Fieldset>
      <Fieldset isDisclosureDisabled={true}>
        <Fieldset.Legend>
          <FormattedMessage defaultMessage="Default file inspection options" />
        </Fieldset.Legend>
        <Fieldset.Fields>
          <ModelSelect
            control={control}
            name="inference.defaultInferenceOptions.fileInspection"
            label={intl.formatMessage({ defaultMessage: "Model" })}
            modelOptions={modelOptions}
          />
        </Fieldset.Fields>
      </Fieldset>
    </>
  );
}

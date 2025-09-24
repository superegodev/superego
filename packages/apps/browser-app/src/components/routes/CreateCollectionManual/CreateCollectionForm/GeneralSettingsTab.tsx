import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFEmojiField from "../../../widgets/RHFEmojiField/RHFEmojiField.js";
import RHFTextField from "../../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CreateCollectionForm.css.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";

interface Props {
  control: Control<CreateCollectionFormValues, any, CreateCollectionFormValues>;
}
export default function GeneralSettingsTab({ control }: Props) {
  const intl = useIntl();
  return (
    <>
      <div className={cs.GeneralSettingsTab.nameIconInputs}>
        <RHFEmojiField
          control={control}
          name="icon"
          label={intl.formatMessage({ defaultMessage: "Icon" })}
        />
        <RHFTextField
          control={control}
          name="name"
          label={intl.formatMessage({ defaultMessage: "Name" })}
          autoFocus={true}
          className={cs.GeneralSettingsTab.nameInput}
        />
      </div>
      <RHFTextField
        control={control}
        name="description"
        label={intl.formatMessage({ defaultMessage: "Description" })}
        textArea={true}
        emptyInputValue={null}
      />
      <RHFTextField
        control={control}
        name="assistantInstructions"
        label={intl.formatMessage({ defaultMessage: "Assistant instructions" })}
        textArea={true}
        emptyInputValue={null}
        description={intl.formatMessage({
          defaultMessage:
            "Specific instructions for this collection to pass to the assistant.",
        })}
      />
    </>
  );
}

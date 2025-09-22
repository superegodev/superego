import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { CollectionCategory } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateCollectionCategory } from "../../../business-logic/backend/hooks.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFEmojiField from "../RHFEmojiField/RHFEmojiField.js";
import RHFSubmitButton from "../RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../RHFTextField/RHFTextField.js";
import * as cs from "./CollectionsTree.css.js";

interface FormValues {
  name: string;
  icon: string | null;
}

interface Props {
  collectionCategory: CollectionCategory;
  isOpen: boolean;
  onClose: () => void;
}
export default function RenameCollectionCategoryModalForm({
  collectionCategory,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();

  const { result, mutate } = useUpdateCollectionCategory();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: collectionCategory.name,
      icon: collectionCategory.icon,
    },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.collectionCategoryName(),
        icon: v.nullable(valibotSchemas.icon()),
      }),
    ),
  });

  const onSubmit = async ({ name, icon }: FormValues) => {
    const { success } = await mutate(collectionCategory.id, { name, icon });
    if (success) {
      onClose();
      reset({ name, icon });
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Rename collection category "{name}"'
          values={{ name: collectionCategory.name }}
        />
      </ModalDialog.Heading>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className={cs.RenameCollectionCategoryModalForm.inputs}>
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
            className={cs.RenameCollectionCategoryModalForm.nameInput}
          />
        </div>
        <div
          className={cs.RenameCollectionCategoryModalForm.submitButtonContainer}
        >
          <RHFSubmitButton control={control} variant="primary">
            <FormattedMessage defaultMessage="Save" />
          </RHFSubmitButton>
        </div>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}

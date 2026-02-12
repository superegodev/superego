import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import forms from "../../../business-logic/forms/forms.js";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.js";
import type { UiOptions } from "../../widgets/RHFContentField/uiOptions.js";
import * as cs from "./CollectionPreviewsTabs.css.js";
import type CollectionPreviewsTabsItem from "./CollectionPreviewsTabsItem.js";

interface Props {
  collection: CollectionPreviewsTabsItem;
  protoCollections: UiOptions["protoCollections"];
}
export default function CollectionPreview({
  collection,
  protoCollections,
}: Props) {
  const defaultValues =
    collection.exampleDocument !== undefined
      ? forms.utils.RHFContent.toRHFContent(
          collection.exampleDocument,
          collection.schema,
        )
      : forms.defaults.schemaValue(collection.schema);

  const { control, handleSubmit } = useForm<any>({
    defaultValues,
    mode: "onSubmit",
    disabled: true,
  });

  return (
    <Form
      onSubmit={handleSubmit(() => {})}
      className={cs.CollectionPreview.root}
    >
      <RHFContentField
        schema={collection.schema}
        control={control}
        showNullability={true}
        zoomLevel={0.9}
        isReadOnly={true}
        protoCollections={protoCollections}
      />
    </Form>
  );
}

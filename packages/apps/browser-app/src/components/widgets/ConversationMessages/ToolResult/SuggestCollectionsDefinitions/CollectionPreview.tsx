import type { ToolCall } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import RHFContentField from "../../../RHFContentField/RHFContentField.jsx";
import type { UiOptions } from "../../../RHFContentField/uiOptions.js";
import * as cs from "../ToolResult.css.js";

interface Props {
  collection: ToolCall.SuggestCollectionsDefinitions["input"]["collections"][number];
  suggestedCollections: UiOptions["suggestedCollections"];
}
export default function CollectionPreview({
  collection,
  suggestedCollections,
}: Props) {
  const { schema, exampleDocument } = collection;

  const { control, handleSubmit } = useForm<any>({
    defaultValues: exampleDocument,
    mode: "onSubmit",
    disabled: true,
  });

  return (
    <div className={cs.CollectionPreview.root}>
      <Form
        onSubmit={handleSubmit(() => {})}
        className={cs.CollectionPreview.form}
      >
        <div className={cs.CollectionPreview.scrollContainer}>
          <RHFContentField
            schema={schema}
            control={control}
            showNullability={true}
            zoomLevel={0.9}
            suggestedCollections={suggestedCollections}
          />
        </div>
      </Form>
    </div>
  );
}

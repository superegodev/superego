import type { Schema } from "@superego/schema";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import RHFContentField from "../../widgets/RHFContentField/RHFContentField.jsx";
import * as cs from "./CollectionCreatorConversation.css.js";

interface Props {
  schema: Schema;
  exampleDocument: any;
}
export default function PreviewDocumentForm({
  schema,
  exampleDocument,
}: Props) {
  const { control, handleSubmit } = useForm<any>({
    defaultValues: exampleDocument,
    mode: "onSubmit",
    disabled: true,
  });
  return (
    <section className={cs.PreviewDocumentForm.root}>
      <h5 className={cs.PreviewDocumentForm.title}>
        <FormattedMessage defaultMessage="Schema preview" />
      </h5>
      <Form
        onSubmit={handleSubmit(() => {})}
        className={cs.PreviewDocumentForm.form}
      >
        <div className={cs.PreviewDocumentForm.scrollContainer}>
          <RHFContentField schema={schema} control={control} document={null} />
        </div>
      </Form>
    </section>
  );
}

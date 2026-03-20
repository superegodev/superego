import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { Description, Switch } from "../../design-system/forms/forms.js";
import * as cs from "./RHFRedirectToCollectionAfterDocumentCreationField.css.js";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> extends UseControllerProps<TFieldValues, TName, TTransformedValues> {}
export default function RHFRedirectToCollectionAfterDocumentCreationField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: Props<TFieldValues, TName, TTransformedValues>) {
  const { field } = useController(props);
  return (
    <div className={cs.RHFRedirectToCollectionAfterDocumentCreationField.root}>
      <Switch isSelected={field.value} onChange={field.onChange}>
        <FormattedMessage defaultMessage="Redirect to collection after document creation" />
      </Switch>
      <Description
        className={
          cs.RHFRedirectToCollectionAfterDocumentCreationField.description
        }
      >
        <FormattedMessage defaultMessage="When enabled, creating a document will navigate back to the collection page instead of to the new document." />
      </Description>
    </div>
  );
}

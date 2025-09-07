import type { SummaryPropertyDefinition } from "@superego/backend";
import { type Control, useFieldArray } from "react-hook-form";
import { PiBackspace, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import Alert from "../../design-system/Alert/Alert.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import type TypescriptLib from "../../design-system/TypescriptModuleInput/TypescriptLib.js";
import RHFSummaryPropertyDefinitionField from "../RHFSummaryPropertyDefinitionField/RHFSummaryPropertyDefinitionField.js";
import * as cs from "./RHFSummaryPropertyDefinitionsField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  isDisabled?: boolean | undefined;
  schemaTypescriptLib: TypescriptLib | null;
  getDefaultSummaryPropertyDefinition: (
    index: number,
  ) => SummaryPropertyDefinition;
  defaultExpanded?: boolean | undefined;
  className?: string | undefined;
}
export default function RHFSummaryPropertyDefinitionsField({
  control,
  name,
  isDisabled,
  schemaTypescriptLib,
  getDefaultSummaryPropertyDefinition,
  defaultExpanded,
  className,
}: Props) {
  const intl = useIntl();
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <Fieldset
      className={className}
      disabled={isDisabled}
      isDisclosureDisabled={true}
    >
      <FieldLabel
        component="legend"
        actions={
          !isDisabled ? (
            <FieldLabel.Action
              label={intl.formatMessage({
                defaultMessage: "Add summary property",
              })}
              onPress={() =>
                append(getDefaultSummaryPropertyDefinition(fields.length))
              }
            >
              <PiPlus />
            </FieldLabel.Action>
          ) : null
        }
      >
        <FormattedMessage defaultMessage="Summary properties" />
      </FieldLabel>
      <Fieldset.Fields>
        <Alert
          variant="neutral"
          className={cs.RHFSummaryPropertyDefinitionsField.description}
        >
          <FormattedMessage
            defaultMessage={`
              <p>
                The <b>summary properties</b> of a document are its most
                important bits of information that are displayed when showing a
                "summary view" of the document. For example, they are shown in
                documents tables, where there's a column for each property.
              </p>
              <p>
                You define summary properties, providing for each property:
              </p>
              <ul>
                <li>
                  A<b> Name</b>, which is the label shown in the UI.
                </li>
                <li>
                  A <b>Value getter</b>, a TypeScript function that returns the
                  value of the property. (Must be a string.)
                </li>
              </ul>
              <p>
                There must be always at least one summary property defined.
              </p>
            `}
            values={{
              // Hack to avoid React 19 key errors. Should be solved in the next
              // version of react-intl. At that point:
              // - Remove the keys.
              // - Fix the first A<b> Name spacing above.
              b: (chunks) => <b key={(chunks as string[])[0]}>{chunks}</b>,
              p: (chunks) => <p key={(chunks as string[])[0]}>{chunks}</p>,
              ul: (chunks) => <ul key={(chunks as string[])[0]}>{chunks}</ul>,
              li: (chunks) => <li key={(chunks as string[])[0]}>{chunks}</li>,
            }}
          />
        </Alert>
        {fields.map((item, index) => (
          <div
            key={item.id}
            className={cs.RHFSummaryPropertyDefinitionsField.item}
          >
            <div className={cs.RHFSummaryPropertyDefinitionsField.itemActions}>
              {fields.length > 1 && !isDisabled ? (
                <IconButton
                  onPress={() => remove(index)}
                  variant="invisible"
                  label={intl.formatMessage({ defaultMessage: "Delete" })}
                  tooltipPlacement="left"
                  tooltipCloseDelay={0}
                  className={cs.RHFSummaryPropertyDefinitionsField.itemAction}
                >
                  <PiBackspace />
                </IconButton>
              ) : null}
            </div>
            <RHFSummaryPropertyDefinitionField
              control={control}
              name={`${name}.${index}`}
              isDisabled={isDisabled}
              schemaTypescriptLib={schemaTypescriptLib}
              defaultExpanded={defaultExpanded}
            />
          </div>
        ))}
      </Fieldset.Fields>
    </Fieldset>
  );
}

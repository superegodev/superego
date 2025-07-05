import type { SummaryPropertyDefinition } from "@superego/backend";
import { type Control, useFieldArray } from "react-hook-form";
import { PiBackspace, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
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
  className?: string | undefined;
}
export default function RHFSummaryPropertyDefinitionsField({
  control,
  name,
  isDisabled,
  schemaTypescriptLib,
  getDefaultSummaryPropertyDefinition,
  className,
}: Props) {
  const intl = useIntl();
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <Fieldset className={className} disabled={isDisabled}>
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
            />
          </div>
        ))}
      </Fieldset.Fields>
    </Fieldset>
  );
}

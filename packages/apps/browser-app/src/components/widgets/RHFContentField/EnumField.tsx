import type { EnumTypeDefinition } from "@superego/schema";
import { type Control, useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import classnames from "../../../utils/classnames.js";
import {
  FieldError,
  Select,
  SelectButton,
  SelectOptions,
} from "../../design-system/forms/forms.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";

interface Props {
  typeDefinition: EnumTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function EnumField({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { zoomLevel } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  const sortedMemberNames =
    typeDefinition.membersOrder ?? Object.keys(typeDefinition.members);
  return (
    <Select
      id={field.name}
      name={field.name}
      value={field.value ?? null}
      onChange={field.onChange}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(cs.Field.root, isListItem && cs.ListItemField.root)}
    >
      {!isListItem ? (
        <AnyFieldLabel
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
          actions={
            <NullifyFieldAction
              isNullable={isNullable}
              field={field}
              fieldLabel={label}
            />
          }
        />
      ) : null}
      <SelectButton
        placeholder={
          <FormattedMessage defaultMessage="null - click to select a value" />
        }
      />
      <FieldError>{fieldState.error?.message}</FieldError>
      <SelectOptions
        options={sortedMemberNames.map((memberName) => {
          const member = typeDefinition.members[memberName]!;
          return {
            id: member.value,
            label: member.value,
            description: member.description,
          };
        })}
        zoomLevel={zoomLevel}
      />
    </Select>
  );
}

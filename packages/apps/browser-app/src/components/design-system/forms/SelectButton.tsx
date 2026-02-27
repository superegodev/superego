import type { ReactNode } from "react";
import { Button, Group, SelectValue } from "react-aria-components";
import { PiCaretDown, PiX } from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./forms.css.js";

interface Props {
  onClear?: (() => void) | undefined;
  placeholder?: ReactNode | undefined;
  triggerClassName?: string | undefined;
}
export default function SelectButton({
  onClear,
  placeholder,
  triggerClassName,
}: Props) {
  const intl = useIntl();
  return (
    <Group className={cs.SelectButton.root}>
      <Button className={classnames(cs.SelectButton.trigger, triggerClassName)}>
        <SelectValue className={cs.SelectButton.selectValue}>
          {({ defaultChildren, isPlaceholder }) =>
            isPlaceholder ? (
              <span className={cs.SelectButton.placeholder}>
                {placeholder ?? defaultChildren}
              </span>
            ) : (
              defaultChildren
            )
          }
        </SelectValue>
        {onClear ? <div className={cs.SelectButton.clearButtonStub} /> : null}
        <PiCaretDown aria-hidden="true" />
      </Button>
      {onClear ? (
        <IconButton
          slot={null}
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Clear" })}
          onPress={onClear}
          className={cs.SelectButton.clearButton}
        >
          <PiX aria-hidden="true" />
        </IconButton>
      ) : null}
    </Group>
  );
}

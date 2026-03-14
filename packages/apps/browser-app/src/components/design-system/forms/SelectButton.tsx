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
  prefix?: ReactNode | undefined;
  triggerClassName?: string | undefined;
}
export default function SelectButton({
  onClear,
  placeholder,
  prefix,
  triggerClassName,
}: Props) {
  const intl = useIntl();
  return (
    <Group className={cs.SelectButton.root}>
      <Button className={classnames(cs.SelectButton.trigger, triggerClassName)}>
        {prefix}
        <SelectValue className={cs.SelectButton.selectValue}>
          {({ defaultChildren, isPlaceholder, selectedItems }) =>
            isPlaceholder ? (
              <span className={cs.SelectButton.placeholder}>
                {placeholder ?? defaultChildren}
              </span>
            ) : selectedItems && selectedItems.length > 1 ? (
              <span className={cs.SelectButton.selectValueText}>
                {intersperse(
                  selectedItems.map(
                    (item) => (item as { label: string })?.label,
                  ),
                  ", ",
                )}
              </span>
            ) : (
              defaultChildren
            )
          }
        </SelectValue>
        {onClear ? <div className={cs.SelectButton.clearButtonStub} /> : null}
        <PiCaretDown aria-hidden="true" className={cs.SelectButton.caret} />
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

function intersperse(items: ReactNode[], separator: ReactNode): ReactNode[] {
  return items.flatMap((item, i) => (i === 0 ? [item] : [separator, item]));
}

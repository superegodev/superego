import type { ReactNode } from "react";
import { Button, Group, SelectValue } from "react-aria-components";
import { PiCaretDown } from "react-icons/pi";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./forms.css.js";
import type SelectOption from "./SelectOption.js";

interface Props {
  onClear?: (() => void) | undefined;
  placeholder?: ReactNode | undefined;
}
export default function SelectButton({ onClear, placeholder }: Props) {
  const { clearButton } = useIntlMessages("forms");
  return (
    <Group className={cs.SelectButton.root}>
      <Button className={cs.SelectButton.trigger}>
        <SelectValue<SelectOption> className={cs.SelectButton.selectValue}>
          {({ defaultChildren, isPlaceholder, selectedItems }) =>
            isPlaceholder ? (
              <span className={cs.SelectButton.placeholder}>
                {placeholder ?? defaultChildren}
              </span>
            ) : selectedItems && selectedItems.length > 1 ? (
              <span className={cs.SelectButton.selectValueText}>
                {intersperse(
                  selectedItems.map((item) => item?.label),
                  ", ",
                )}
              </span>
            ) : (
              defaultChildren
            )
          }
        </SelectValue>
        <div className={cs.SelectButton.clearButtonStub} />
        <PiCaretDown aria-hidden="true" className={cs.SelectButton.caret} />
      </Button>
      {onClear ? (
        <IconButton
          slot={null}
          variant="invisible"
          icon="x"
          label={clearButton}
          onPress={onClear}
          className={cs.SelectButton.clearButton}
        />
      ) : null}
    </Group>
  );
}

function intersperse(items: ReactNode[], separator: ReactNode): ReactNode[] {
  return items.flatMap((item, i) => (i === 0 ? [item] : [separator, item]));
}

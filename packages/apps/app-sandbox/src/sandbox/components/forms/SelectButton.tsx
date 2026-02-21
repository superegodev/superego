import type { ReactNode } from "react";
import { SelectValue } from "react-aria-components";
import { PiCaretDown, PiX } from "react-icons/pi";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import Button from "../Button/Button.js";
import * as cs from "./forms.css.js";
import type SelectOption from "./SelectOption.js";

interface Props {
  onClear?: (() => void) | undefined;
  placeholder?: ReactNode | undefined;
}
export default function SelectButton({ onClear, placeholder }: Props) {
  const { clearButton } = useIntlMessages("forms");
  return (
    <Button className={cs.SelectButton.root}>
      <SelectValue<SelectOption> className={cs.SelectButton.selectValue}>
        {({ defaultChildren, isPlaceholder, selectedItems }) =>
          isPlaceholder ? (
            <span className={cs.SelectButton.placeholder}>{placeholder}</span>
          ) : selectedItems && selectedItems.length > 1 ? (
            intersperse(
              selectedItems.map((item) => item?.label),
              ", ",
            )
          ) : (
            defaultChildren
          )
        }
      </SelectValue>
      {onClear ? (
        <Button
          slot={null}
          aria-label={clearButton}
          onPress={onClear}
          className={cs.SelectButton.clearButton}
        >
          <PiX aria-hidden="true" />
        </Button>
      ) : null}
      <PiCaretDown aria-hidden="true" />
    </Button>
  );
}

function intersperse(items: ReactNode[], separator: ReactNode): ReactNode[] {
  return items.flatMap((item, i) => (i === 0 ? [item] : [separator, item]));
}

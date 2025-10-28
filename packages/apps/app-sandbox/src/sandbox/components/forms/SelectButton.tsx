import type { ReactNode } from "react";
import { SelectValue } from "react-aria-components";
import { PiCaretDown } from "react-icons/pi";
import Button from "../Button/Button.js";
import * as cs from "./forms.css.js";

interface Props {
  placeholder?: ReactNode | undefined;
}
export default function SelectButton({ placeholder }: Props) {
  return (
    <Button className={cs.SelectButton.root}>
      <SelectValue className={cs.SelectButton.selectValue}>
        {({ defaultChildren, isPlaceholder }) =>
          isPlaceholder ? (
            <span className={cs.SelectButton.placeholder}>{placeholder}</span>
          ) : (
            defaultChildren
          )
        }
      </SelectValue>
      <PiCaretDown aria-hidden="true" />
    </Button>
  );
}

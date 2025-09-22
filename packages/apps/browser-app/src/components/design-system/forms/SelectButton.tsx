import type { ReactNode } from "react";
import { SelectValue } from "react-aria-components";
import { PiCaretDown } from "react-icons/pi";
import classnames from "../../../utils/classnames.js";
import Button from "../Button/Button.js";
import * as cs from "./forms.css.js";

interface Props {
  placeholder?: ReactNode | undefined;
  className?: string | undefined;
}
export default function SelectButton({ placeholder, className }: Props) {
  return (
    <Button className={classnames(cs.SelectButton.root, className)}>
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

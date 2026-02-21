import type { ReactNode } from "react";
import { SelectValue } from "react-aria-components";
import { PiCaretDown, PiX } from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import Button from "../Button/Button.js";
import * as cs from "./forms.css.js";

interface Props {
  onClear?: (() => void) | undefined;
  placeholder?: ReactNode | undefined;
  className?: string | undefined;
}
export default function SelectButton({
  onClear,
  placeholder,
  className,
}: Props) {
  const intl = useIntl();
  return (
    <Button className={classnames(cs.SelectButton.root, className)}>
      <SelectValue className={cs.SelectButton.selectValue}>
        {({ defaultChildren, isPlaceholder }) =>
          isPlaceholder && placeholder !== undefined ? (
            <span className={cs.SelectButton.placeholder}>{placeholder}</span>
          ) : (
            defaultChildren
          )
        }
      </SelectValue>
      {onClear ? (
        <Button
          slot={null}
          aria-label={intl.formatMessage({ defaultMessage: "Clear" })}
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

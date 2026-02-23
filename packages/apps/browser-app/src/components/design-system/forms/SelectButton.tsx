import type { ReactNode } from "react";
import { Button, Group, SelectValue } from "react-aria-components";
import { PiCaretDown, PiX } from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import IconButton from "../IconButton/IconButton.jsx";
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
    <Group className={classnames(cs.SelectButton.root, className)}>
      <Button className={cs.SelectButton.trigger}>
        <SelectValue className={cs.SelectButton.selectValue}>
          {({ defaultChildren, isPlaceholder }) =>
            isPlaceholder && placeholder !== undefined ? (
              <span className={cs.SelectButton.placeholder}>{placeholder}</span>
            ) : (
              defaultChildren
            )
          }
        </SelectValue>
        <div className={cs.SelectButton.clearButtonStub} />
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

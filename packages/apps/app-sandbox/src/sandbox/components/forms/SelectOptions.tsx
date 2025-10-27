import type { ReactNode } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { PiCheck } from "react-icons/pi";
import Popover from "../Popover/Popover.js";
import * as cs from "./forms.css.js";

export interface Option {
  value: string;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
}
interface Props {
  options: Option[];
}
export default function SelectOptions({ options }: Props) {
  return (
    <Popover className={cs.SelectOptions.root} maxHeight={280}>
      <ListBox items={options}>
        {({ value, label, description }) => (
          <ListBoxItem
            id={value}
            textValue={value}
            className={cs.SelectOptions.option}
          >
            {({ isSelected }) => (
              <>
                <div className={cs.SelectOptions.optionValue}>
                  {label ?? value}
                </div>
                {description ? (
                  <div className={cs.SelectOptions.optionDescription}>
                    {"\u2002-\u2002"}
                    {description}
                  </div>
                ) : null}
                {isSelected ? <PiCheck /> : null}
              </>
            )}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  );
}

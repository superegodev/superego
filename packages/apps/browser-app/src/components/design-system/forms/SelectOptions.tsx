import type { CSSProperties } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { PiCheck } from "react-icons/pi";
import Popover from "../Popover/Popover.js";
import * as cs from "./forms.css.js";

export interface Option {
  id: string;
  label: string;
  description?: string | undefined;
}
interface Props {
  options: Option[];
  zoomLevel?: number | undefined;
}
export default function SelectOptions({ options, zoomLevel = 1 }: Props) {
  return (
    <Popover
      className={cs.SelectOptions.root}
      style={{ "--zoom-level": zoomLevel } as CSSProperties}
    >
      <ListBox items={options}>
        {({ label, description }) => (
          <ListBoxItem textValue={label} className={cs.SelectOptions.option}>
            {({ isSelected }) => (
              <>
                <div className={cs.SelectOptions.optionValue}>{label}</div>
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

import type { CSSProperties } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";
import { PiCheckBold } from "react-icons/pi";
import classnames from "../../../utils/classnames.js";
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
  matchTriggerWidth?: boolean | undefined;
  className?: string | undefined;
}
export default function SelectOptions({
  options,
  zoomLevel = 1,
  matchTriggerWidth = true,
  className,
}: Props) {
  return (
    <Popover
      className={classnames(cs.SelectOptions.root, className)}
      style={
        {
          "--zoom-level": zoomLevel,
          ...(matchTriggerWidth ? {} : { width: "auto" }),
        } as CSSProperties
      }
    >
      <ListBox items={options} className={cs.SelectOptions.list}>
        {({ label, description }) => (
          <ListBoxItem textValue={label} className={cs.SelectOptions.option}>
            {({ isSelected }) => (
              <>
                <div className={cs.SelectOptions.optionValue}>{label}</div>
                {description ? (
                  <>
                    <span className={cs.SelectOptions.optionDash}>{"-"}</span>
                    <div className={cs.SelectOptions.optionDescription}>
                      {description}
                    </div>
                  </>
                ) : null}
                {isSelected ? <PiCheckBold /> : null}
              </>
            )}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  );
}

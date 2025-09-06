import { ListBox, ListBoxItem } from "react-aria-components";
import Popover from "../Popover/Popover.js";
import * as cs from "./forms.css.js";

export interface Option {
  id: string;
  label: string;
  description?: string | undefined;
}
interface Props {
  options: Option[];
}
export default function SelectOptions({ options }: Props) {
  return (
    <Popover className={cs.SelectOptions.root}>
      <ListBox items={options}>
        {({ label, description }) => (
          <ListBoxItem textValue={label} className={cs.SelectOptions.option}>
            <span>{label}</span>
            {description ? (
              <span className={cs.SelectOptions.optionDescription}>
                {"\u2002-\u2002"}
                {description}
              </span>
            ) : null}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  );
}

import { ListBox, ListBoxItem } from "react-aria-components";
import Popover from "../Popover/Popover.js";
import * as cs from "./forms.css.js";

export interface Option {
  id: string;
  label: string;
}
interface Props {
  options: Option[];
}
export default function SelectOptions({ options }: Props) {
  return (
    <Popover className={cs.SelectOptions.root}>
      <ListBox items={options}>
        {({ label }) => (
          <ListBoxItem textValue={label} className={cs.SelectOptions.option}>
            {label}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  );
}

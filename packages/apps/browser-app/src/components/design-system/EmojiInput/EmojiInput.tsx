import { useState } from "react";
import { Dialog, DialogTrigger } from "react-aria-components";
import { useIntl } from "react-intl";
import IconButton from "../IconButton/IconButton.js";
import Popover from "../Popover/Popover.js";
import * as cs from "./EmojiInput.css.js";
import EmojiPicker from "./EmojiPicker.js";

interface Props {
  value: string | null | undefined;
  onChange: (newValue: string | null) => void;
  id?: string | undefined;
  isReadOnly?: boolean | undefined;
}
export default function EmojiInput({ value, onChange, id, isReadOnly }: Props) {
  const intl = useIntl();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  if (isReadOnly) {
    return (
      <span id={id} className={cs.EmojiInput.popoverTrigger}>
        {value}
      </span>
    );
  }

  return (
    <DialogTrigger>
      <IconButton
        variant="default"
        label={intl.formatMessage({ defaultMessage: "Select emoji" })}
        onPress={() => setIsPopoverOpen(true)}
        id={id}
        className={cs.EmojiInput.popoverTrigger}
      >
        {value}
      </IconButton>
      <Popover
        isOpen={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        className={cs.EmojiInput.popover}
      >
        <Dialog>
          <EmojiPicker
            selectedEmoji={value}
            onSelect={(emoji) => {
              onChange(emoji);
              setIsPopoverOpen(false);
            }}
          />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

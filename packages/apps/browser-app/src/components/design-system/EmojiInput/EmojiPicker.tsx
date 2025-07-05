import * as frimousse from "frimousse";
import { FormattedMessage, useIntl } from "react-intl";
import getLanguageCode from "../../../utils/getLanguageCode.js";
import Button from "../Button/Button.js";
import * as cs from "./EmojiInput.css.js";

const { Root, Search, Viewport, Empty, List } = frimousse.EmojiPicker;

interface Props {
  selectedEmoji: string | null | undefined;
  onSelect: (emoji: string | null) => void;
}
export default function EmojiPicker({ selectedEmoji, onSelect }: Props) {
  const intl = useIntl();
  return (
    <Root
      locale={getLanguageCode(intl) as frimousse.Locale}
      onEmojiSelect={(emoji) => onSelect(emoji.emoji)}
      className={cs.EmojiPicker.root}
    >
      {selectedEmoji ? (
        <div className={cs.EmojiPicker.selectedEmoji}>
          <FormattedMessage
            defaultMessage="Selected: {selectedEmoji}"
            values={{ selectedEmoji }}
          />
          <Button variant="invisible" onPress={() => onSelect(null)}>
            <FormattedMessage defaultMessage="Remove" />
          </Button>
        </div>
      ) : null}
      <Search
        className={cs.EmojiPicker.search}
        placeholder={intl.formatMessage({ defaultMessage: "Search..." })}
        autoFocus={true}
      />
      <Viewport className={cs.EmojiPicker.viewport}>
        <Empty className={cs.EmojiPicker.empty}>
          <FormattedMessage defaultMessage="No matches." />
        </Empty>
        <List
          className={cs.EmojiPicker.list}
          components={{ CategoryHeader, Row, Emoji }}
        />
      </Viewport>
    </Root>
  );
}

function CategoryHeader({
  category,
  ...props
}: frimousse.EmojiPickerListCategoryHeaderProps) {
  return (
    <div className={cs.EmojiPicker.categoryHeader} {...props}>
      {category.label}
    </div>
  );
}

function Row({ children, ...props }: frimousse.EmojiPickerListRowProps) {
  return (
    <div className={cs.EmojiPicker.row} {...props}>
      {children}
    </div>
  );
}

function Emoji({ emoji, ...props }: frimousse.EmojiPickerListEmojiProps) {
  return (
    <button className={cs.EmojiPicker.emoji} {...props}>
      {emoji.emoji}
    </button>
  );
}

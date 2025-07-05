import { PiDotsThree } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import IconButton from "../../design-system/IconButton/IconButton.js";
import PopoverMenu from "../../design-system/PopoverMenu/PopoverMenu.js";
import * as cs from "./CollectionsTree.css.js";

interface Props {
  name: string;
  canDelete: boolean;
  onRename: () => void;
  onDelete: () => void;
}
export default function CollectionCategoryActionsMenu({
  name,
  canDelete,
  onRename,
  onDelete,
}: Props) {
  const intl = useIntl();
  return (
    <PopoverMenu>
      <PopoverMenu.Trigger>
        <IconButton
          label={intl.formatMessage(
            { defaultMessage: "Open {name} actions menu" },
            { name },
          )}
          variant="invisible"
          className={cs.CollectionCategoryActionsMenu.trigger}
        >
          <PiDotsThree />
        </IconButton>
      </PopoverMenu.Trigger>
      <PopoverMenu.Menu>
        <PopoverMenu.MenuItem onAction={onRename}>
          <FormattedMessage defaultMessage="Rename" />
        </PopoverMenu.MenuItem>
        <PopoverMenu.MenuItem isDisabled={!canDelete} onAction={onDelete}>
          <FormattedMessage defaultMessage="Delete" />
        </PopoverMenu.MenuItem>
      </PopoverMenu.Menu>
    </PopoverMenu>
  );
}

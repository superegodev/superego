import { Toolbar } from "react-aria-components";
import { PiFolderSimplePlus, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateCollectionCategory } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import IconLink from "../../design-system/IconLink/IconLink.js";
import * as cs from "./CollectionsTree.css.js";

export default function Header() {
  const intl = useIntl();

  const { isPending, mutate } = useCreateCollectionCategory();
  const onCreateCollectionCategory = () => {
    if (!isPending) {
      mutate({
        name: intl.formatMessage({ defaultMessage: "New Collection Category" }),
        icon: null,
        parentId: null,
      });
    }
  };

  return (
    <div className={cs.Header.root}>
      <FormattedMessage defaultMessage="Collections" />
      <Toolbar className={cs.Header.toolbar}>
        <IconLink
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Create collection" })}
          to={{ name: RouteName.CreateCollection }}
          className={cs.Header.toolbarAction}
        >
          <PiPlus />
        </IconLink>
        <IconButton
          variant="invisible"
          label={intl.formatMessage({
            defaultMessage: "Create collection category",
          })}
          onPress={onCreateCollectionCategory}
          className={cs.Header.toolbarAction}
        >
          <PiFolderSimplePlus />
        </IconButton>
      </Toolbar>
    </div>
  );
}

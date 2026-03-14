import type { Collection, CollectionId } from "@superego/backend";
import { useMemo } from "react";
import { Group, Toolbar } from "react-aria-components";
import {
  PiArrowUDownLeft,
  PiArrowUDownRight,
  PiCode,
  PiPresentationChart,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import classnames from "../../../utils/classnames.js";
import {
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../design-system/forms/forms.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./RHFAppVersionField.css.js";
import View from "./View.js";

interface Props {
  onUndo: () => void;
  isUndoDisabled: boolean;
  onRedo: () => void;
  isRedoDisabled: boolean;
  onActivateView: (view: View) => void;
  activeView: View;
  collections: Collection[];
  selectedCollectionIds: CollectionId[];
  onSelectedCollectionIdsChange: (ids: CollectionId[]) => void;
  className: string;
}
export default function EditingToolbar({
  onUndo,
  isUndoDisabled,
  onRedo,
  isRedoDisabled,
  onActivateView,
  activeView,
  collections,
  selectedCollectionIds,
  onSelectedCollectionIdsChange,
  className,
}: Props) {
  const intl = useIntl();

  const collectionOptions: Option[] = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        label: CollectionUtils.getDisplayName(collection),
      })),
    [collections],
  );

  return (
    <Toolbar className={classnames(cs.EditingToolbar.root, className)}>
      <Group className={cs.EditingToolbar.undoRedoGroup}>
        <IconButton
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Undo" })}
          isDisabled={isUndoDisabled}
          onPress={onUndo}
          className={cs.EditingToolbar.button}
        >
          <PiArrowUDownLeft />
        </IconButton>
        <IconButton
          variant="invisible"
          label={intl.formatMessage({ defaultMessage: "Redo" })}
          isDisabled={isRedoDisabled}
          onPress={onRedo}
          className={cs.EditingToolbar.button}
        >
          <PiArrowUDownRight />
        </IconButton>
      </Group>
      <Select
        selectionMode="multiple"
        aria-label={intl.formatMessage({
          defaultMessage: "Target collections",
        })}
        value={selectedCollectionIds}
        onChange={(value) => {
          if (value.length > 0) {
            onSelectedCollectionIdsChange(value as CollectionId[]);
          }
        }}
        className={cs.EditingToolbar.collectionsSelect}
      >
        <SelectButton
          placeholder={intl.formatMessage({
            defaultMessage: "Select collections",
          })}
        />
        <SelectOptions options={collectionOptions} />
      </Select>
      <IconButton
        variant="invisible"
        label={
          activeView === View.Code
            ? intl.formatMessage({ defaultMessage: "App preview" })
            : intl.formatMessage({ defaultMessage: "View code" })
        }
        onPress={() =>
          onActivateView(activeView === View.Code ? View.Preview : View.Code)
        }
        className={cs.EditingToolbar.button}
      >
        {activeView === View.Code ? <PiPresentationChart /> : <PiCode />}
      </IconButton>
    </Toolbar>
  );
}

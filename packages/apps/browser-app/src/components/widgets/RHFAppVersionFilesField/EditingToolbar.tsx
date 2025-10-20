import { Group, Toolbar } from "react-aria-components";
import {
  PiArrowUDownLeft,
  PiArrowUDownRight,
  PiCode,
  PiPresentationChart,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./RHFAppVersionFilesField.css.js";
import View from "./View.js";

interface Props {
  onUndo: () => void;
  isUndoDisabled: boolean;
  onRedo: () => void;
  isRedoDisabled: boolean;
  onActivateView: (view: View) => void;
  activeView: View;
  className: string;
}
export default function EditingToolbar({
  onUndo,
  isUndoDisabled,
  onRedo,
  isRedoDisabled,
  onActivateView,
  activeView,
  className,
}: Props) {
  const intl = useIntl();
  return (
    <Toolbar className={classnames(cs.EditingToolbar.root, className)}>
      <Group>
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
      <IconButton
        variant="invisible"
        label={
          activeView === View.Code
            ? intl.formatMessage({ defaultMessage: "View code" })
            : intl.formatMessage({ defaultMessage: "App preview" })
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

import { Toolbar } from "react-aria-components";
import {
  PiArrowsIn,
  PiArrowsOut,
  PiMagnifyingGlassMinus,
  PiMagnifyingGlassPlus,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import { useControls } from "react-zoom-pan-pinch";
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./ZoomableImage.css.js";

interface Props {
  minScale: number;
}
export default function Controls({ minScale }: Props) {
  const intl = useIntl();
  const { zoomIn, zoomOut, centerView } = useControls();
  return (
    <Toolbar className={cs.Controls.root}>
      <IconButton
        label={intl.formatMessage({ defaultMessage: "Zoom in" })}
        onPress={() => zoomIn()}
      >
        <PiMagnifyingGlassPlus />
      </IconButton>
      <IconButton
        label={intl.formatMessage({ defaultMessage: "Zoom out" })}
        onPress={() => zoomOut()}
      >
        <PiMagnifyingGlassMinus />
      </IconButton>
      <IconButton
        label={intl.formatMessage({ defaultMessage: "Fit" })}
        onPress={() => centerView(minScale)}
      >
        <PiArrowsIn />
      </IconButton>
      <IconButton
        label={intl.formatMessage({ defaultMessage: "Center" })}
        onPress={() => centerView(1)}
      >
        <PiArrowsOut />
      </IconButton>
    </Toolbar>
  );
}

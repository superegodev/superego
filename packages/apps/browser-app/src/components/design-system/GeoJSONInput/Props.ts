import type GeoJSONFeatureCollection from "./GeoJSONFeatureCollection.js";
import type GeoJSONValue from "./GeoJSONValue.js";

export default interface Props {
  value: GeoJSONValue | null | undefined;
  onChange: (newValue: GeoJSONFeatureCollection) => void;
  onBlur?: (() => void) | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
  className?: string | undefined;
}

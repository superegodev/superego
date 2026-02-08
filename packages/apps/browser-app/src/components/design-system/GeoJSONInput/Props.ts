export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: unknown[];
  [key: string]: unknown;
}

export default interface Props {
  value: GeoJSONFeatureCollection | null | undefined;
  onChange: (newValue: GeoJSONFeatureCollection) => void;
  onBlur?: (() => void) | undefined;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  /**
   * react-hook-form ref callback. Used to allow the input to be focused by rhf
   * in certain circumstances.
   */
  ref?: (refObject: { focus: () => void }) => void;
}

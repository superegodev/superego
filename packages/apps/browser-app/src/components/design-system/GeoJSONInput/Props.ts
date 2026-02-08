export type GeoJSONInputValue = Record<string, unknown> | null | undefined;

export default interface Props {
  value: GeoJSONInputValue;
  onChange?: (value: GeoJSONInputValue) => void;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  className?: string | undefined;
}

export type GeoJSONInputValue = Record<string, unknown> | null | undefined;

export default interface Props {
  value: GeoJSONInputValue;
  isInvalid?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  className?: string | undefined;
}

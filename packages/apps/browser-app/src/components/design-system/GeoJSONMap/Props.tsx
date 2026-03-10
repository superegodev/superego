export default interface Props {
  geoJSON: { type: string; [key: string]: unknown };
  width: string;
  height: string;
  className?: string | undefined;
}

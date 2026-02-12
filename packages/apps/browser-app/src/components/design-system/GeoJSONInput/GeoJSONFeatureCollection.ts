export default interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: unknown[];
  [key: string]: unknown;
}

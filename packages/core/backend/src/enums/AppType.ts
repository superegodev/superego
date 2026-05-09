import * as v from "valibot";

enum AppType {
  CollectionView = "CollectionView",
}
export default AppType;

export const AppTypeSchema = v.enum(AppType);

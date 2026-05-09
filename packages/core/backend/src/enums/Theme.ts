import * as v from "valibot";

enum Theme {
  Light = "Light",
  Dark = "Dark",
  Auto = "Auto",
}
export default Theme;

export const ThemeSchema = v.enum(Theme);

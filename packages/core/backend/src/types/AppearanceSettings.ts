import * as v from "valibot";
import { ThemeSchema } from "../enums/Theme.js";

const AppearanceSettingsSchema = v.object({
  theme: ThemeSchema,
});
export default AppearanceSettingsSchema;
export type AppearanceSettings = v.InferOutput<typeof AppearanceSettingsSchema>;

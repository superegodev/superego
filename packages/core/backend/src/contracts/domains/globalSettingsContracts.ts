import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import GlobalSettingsNotValidSchema from "../../errors/GlobalSettingsNotValid.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import GlobalSettingsSchema from "../../types/GlobalSettings.js";

// `Partial<GlobalSettings>` for the patch — caller may supply any subset of
// the top-level fields. We accept `v.any()` for each so the structural check
// only verifies the outer shape; the usecase performs the deep merge and
// re-validation against the existing semantic schema.
const globalSettingsPatchSchema = v.object({
  inference: v.optional(v.any()),
  assistants: v.optional(v.any()),
  appearance: v.optional(v.any()),
});

export const globalSettingsContracts = {
  get: {
    argumentsSchema: v.tuple([]),
    dataSchema: GlobalSettingsSchema,
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  update: {
    argumentsSchema: v.tuple([globalSettingsPatchSchema]),
    dataSchema: GlobalSettingsSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      GlobalSettingsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;

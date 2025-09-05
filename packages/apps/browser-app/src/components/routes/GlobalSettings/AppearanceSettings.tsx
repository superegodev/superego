import { type GlobalSettings, Theme } from "@superego/backend";
import type { Control } from "react-hook-form";
import { useIntl } from "react-intl";
import RHFSelectField from "../../widgets/RHFSelectField/RHFSelectField.js";

interface Props {
  control: Control<GlobalSettings, any, GlobalSettings>;
}
export default function AppearanceSettings({ control }: Props) {
  const intl = useIntl();
  return (
    <RHFSelectField
      control={control}
      name="appearance.theme"
      options={Object.values(Theme).map((theme) => ({
        id: theme,
        label: theme,
      }))}
      label={intl.formatMessage({ defaultMessage: "Theme" })}
    />
  );
}

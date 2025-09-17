import { useState } from "react";
import { PiCode, PiRobot } from "react-icons/pi";
import { useIntl } from "react-intl";
import Shell from "../../design-system/Shell/Shell.js";
import AssistedMode from "./AssistedMode/AssistedMode.jsx";
import ManualMode from "./ManualMode/ManualMode.js";

export default function CreateCollection() {
  const intl = useIntl();
  const [mode, setMode] = useState<"assisted" | "manual">("assisted");
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Create Collection" })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Create collection actions",
        })}
        actions={[
          {
            label:
              mode === "assisted"
                ? intl.formatMessage({ defaultMessage: "Manual mode" })
                : intl.formatMessage({ defaultMessage: "Assisted mode" }),
            icon: mode === "assisted" ? <PiCode /> : <PiRobot />,
            onPress: () => setMode(mode === "assisted" ? "manual" : "assisted"),
          },
        ]}
      />
      <Shell.Panel.Content>
        {mode === "assisted" ? <AssistedMode /> : <ManualMode />}
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

import { useState } from "react";
import { PiEye, PiEyeFill, PiRobot, PiRobotFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import Shell from "../../design-system/Shell/Shell.js";
import CreateCollectionForm from "./CreateCollectionForm/CreateCollectionForm.js";

interface SidebarStatus {
  open: boolean;
  content: "assistant" | "preview" | null;
}

export default function CreateCollection() {
  const intl = useIntl();
  const [sidebarStatus, setSidebarStatus] = useState<SidebarStatus>({
    open: false,
    content: null,
  });
  const isShowingAssistant =
    sidebarStatus.open && sidebarStatus.content === "assistant";
  const isShowingPreview =
    sidebarStatus.open && sidebarStatus.content === "preview";
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Create Collection" })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Collection creator actions",
        })}
        actions={[
          {
            label: isShowingAssistant
              ? intl.formatMessage({ defaultMessage: "Close assistant" })
              : intl.formatMessage({ defaultMessage: "Open assistant" }),
            icon: isShowingAssistant ? <PiRobotFill /> : <PiRobot />,
            onPress: () =>
              setSidebarStatus({
                open: !isShowingAssistant,
                content: isShowingAssistant ? null : "assistant",
              }),
          },
          {
            label: isShowingPreview
              ? intl.formatMessage({ defaultMessage: "Close preview" })
              : intl.formatMessage({ defaultMessage: "Open preview" }),
            icon: isShowingPreview ? <PiEyeFill /> : <PiEye />,
            onPress: () =>
              setSidebarStatus({
                open: !isShowingPreview,
                content: isShowingPreview ? null : "preview",
              }),
          },
        ]}
      />
      <Shell.Panel.Content>
        <CreateCollectionForm />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { electronMainWorld } from "../../../business-logic/electron/electron.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import isEmpty from "../../../utils/isEmpty.js";
import InlineCode from "../../design-system/InlineCode/InlineCode.js";
import Link from "../../design-system/Link/Link.js";
import * as cs from "./Ask.css.js";
import WelcomeStep from "./WelcomeStep.js";

export default function Welcome() {
  const { globalSettings, collections, apps } = useGlobalData();

  const [isCliInstalled, setIsCliInstalled] = useState(
    !electronMainWorld.isElectron,
  );

  useEffect(() => {
    if (!electronMainWorld.isElectron) {
      return;
    }

    electronMainWorld.cli.isInstalled().then(setIsCliInstalled);
  }, []);

  const isStep1Complete = !isEmpty(globalSettings.inference.providers);
  const isInstallCliStepComplete = isCliInstalled;
  const isStep2Complete = !isEmpty(collections);
  const isStep3Complete = !isEmpty(apps);

  const isStep2Enabled = isStep1Complete;
  const isStep3Enabled = isStep1Complete && isStep2Complete;

  const showWelcome =
    !isStep1Complete ||
    !isInstallCliStepComplete ||
    !isStep2Complete ||
    !isStep3Complete;

  const installCli = async () => {
    if (!electronMainWorld.isElectron || isCliInstalled) {
      return;
    }
    const installed = await electronMainWorld.cli.install();
    setIsCliInstalled(installed);
  };

  return showWelcome ? (
    <div className={cs.Welcome.root}>
      <p className={cs.Welcome.heading}>
        <FormattedMessage defaultMessage="To get started:" />
      </p>
      <ol className={cs.Welcome.steps}>
        <WelcomeStep completed={isStep1Complete} enabled={true}>
          <FormattedMessage
            defaultMessage="<settingsLink>Configure the AI assistant</settingsLink>."
            values={{
              settingsLink: (chunks: ReactNode) =>
                isStep1Complete ? (
                  chunks
                ) : (
                  <Link
                    to={{ name: RouteName.GlobalSettings }}
                    className={cs.Welcome.stepLink}
                  >
                    {chunks}
                  </Link>
                ),
            }}
          />
        </WelcomeStep>
        {electronMainWorld.isElectron ? (
          <WelcomeStep completed={isInstallCliStepComplete} enabled={true}>
            <FormattedMessage
              defaultMessage="<installCliButton>Install the <cliName>superego</cliName> CLI</installCliButton>."
              values={{
                cliName: (chunks: ReactNode) => (
                  <InlineCode>{chunks}</InlineCode>
                ),
                installCliButton: (chunks: ReactNode) =>
                  isInstallCliStepComplete ? (
                    chunks
                  ) : (
                    <button
                      type="button"
                      onClick={installCli}
                      className={cs.Welcome.stepButton}
                    >
                      {chunks}
                    </button>
                  ),
              }}
            />
          </WelcomeStep>
        ) : null}
        <WelcomeStep completed={isStep2Complete} enabled={isStep2Enabled}>
          <FormattedMessage
            defaultMessage="<createCollectionLink>Create your first collection</createCollectionLink>, or <boutiqueLink>install a pre-made one</boutiqueLink> from the Boutique."
            values={{
              createCollectionLink: (chunks: ReactNode) =>
                isStep2Complete ? (
                  chunks
                ) : (
                  <Link
                    to={{ name: RouteName.CreateCollectionAssisted }}
                    className={cs.Welcome.stepLink}
                  >
                    {chunks}
                  </Link>
                ),
              boutiqueLink: (chunks: ReactNode) =>
                isStep2Complete ? (
                  chunks
                ) : (
                  <Link
                    to={{ name: RouteName.Boutique }}
                    className={cs.Welcome.stepLink}
                  >
                    {chunks}
                  </Link>
                ),
            }}
          />
        </WelcomeStep>
        <WelcomeStep completed={isStep3Complete} enabled={isStep3Enabled}>
          <FormattedMessage
            defaultMessage="<createAppLink>Create your first app</createAppLink>."
            values={{
              createAppLink: (chunks: ReactNode) =>
                isStep3Complete ? (
                  chunks
                ) : (
                  <Link
                    to={{
                      name: RouteName.CreateApp,
                      initialCollectionIds: collections.map(
                        (collection) => collection.id,
                      ),
                    }}
                    className={cs.Welcome.stepLink}
                  >
                    {chunks}
                  </Link>
                ),
            }}
          />
        </WelcomeStep>
      </ol>
    </div>
  ) : null;
}

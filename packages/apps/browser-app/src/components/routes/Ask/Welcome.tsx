import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import isEmpty from "../../../utils/isEmpty.js";
import Link from "../../design-system/Link/Link.js";
import * as cs from "./Ask.css.js";
import WelcomeStep from "./WelcomeStep.js";

export default function Welcome() {
  const { globalSettings, collections, apps } = useGlobalData();

  const isStep1Complete = !isEmpty(globalSettings.inference.providers);
  const isStep2Complete = !isEmpty(collections);
  const isStep3Complete = !isEmpty(apps);

  const isStep2Enabled = isStep1Complete;
  const isStep3Enabled = isStep1Complete && isStep2Complete;

  const showWelcome = !isStep1Complete || !isStep2Complete || !isStep3Complete;

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
                      collectionIds: collections.map(
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

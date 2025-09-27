import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useLoadDemoData from "../../../business-logic/load-demo-data/useLoadDemoData.js";
import useLocalStorageItem from "../../../business-logic/local-storage/useLocalStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import * as cs from "./LoadDemoDataButton.css.js";

export default function LoadDemoDataButton() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const loadDemoData = useLoadDemoData();

  const [hasDemoDataLoaded, setHasLoadedDemoData] = useLocalStorageItem(
    WellKnownKey.HasLoadedDemoData,
    false,
  );
  const [isModalOpen, setIsModal] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: loadDemoData,
    onSuccess() {
      queryClient.invalidateQueries();
      setHasLoadedDemoData(true);
    },
  });

  return (
    <>
      <Button
        variant="primary"
        className={cs.LoadDemoDataButton.button}
        onPress={() => setIsModal(true)}
      >
        {!hasDemoDataLoaded
          ? intl.formatMessage({ defaultMessage: "Load demo data" })
          : intl.formatMessage({ defaultMessage: "Reset demo data" })}
      </Button>

      <ModalDialog
        isDismissable={true}
        isOpen={isModalOpen}
        onOpenChange={setIsModal}
      >
        <ModalDialog.Heading>
          {!hasDemoDataLoaded ? (
            <FormattedMessage defaultMessage="Load demo data" />
          ) : (
            <FormattedMessage defaultMessage="Reset demo data" />
          )}
        </ModalDialog.Heading>
        {!hasDemoDataLoaded ? (
          <p>
            <FormattedMessage defaultMessage="Loads some demo collections and documents for you to play around with." />
          </p>
        ) : null}
        <p>
          {!hasDemoDataLoaded ? (
            <FormattedMessage defaultMessage="Attention: loading demo data erases all the data you've saved so far. Continue?" />
          ) : (
            <FormattedMessage defaultMessage="Attention: resetting demo data erases all the data you've saved so far. Continue?" />
          )}
        </p>
        <Button
          variant="primary"
          onPress={() => {
            setIsModal(false);
            navigateTo({ name: RouteName.Ask });
            // Hack: to avoid texts changing from "load" to "reset" while the
            // modal is closing, we first close the modal, wait a bit, then
            // actually trigger the mutation.
            setTimeout(async () => {
              await mutateAsync();
              setHasLoadedDemoData(true);
            }, 150);
          }}
        >
          {!hasDemoDataLoaded ? (
            <FormattedMessage defaultMessage="Yes, load" />
          ) : (
            <FormattedMessage defaultMessage="Yes, reset" />
          )}
        </Button>
      </ModalDialog>
    </>
  );
}

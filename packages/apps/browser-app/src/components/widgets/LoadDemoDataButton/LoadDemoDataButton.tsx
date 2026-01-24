import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import type LoadDemoDataProgress from "../../../business-logic/load-demo-data/LoadDemoDataProgress.js";
import useLoadDemoData from "../../../business-logic/load-demo-data/useLoadDemoData.js";
import useLocalStorageItem from "../../../business-logic/local-storage/useLocalStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ProgressBar from "../../design-system/ProgressBar/ProgressBar.js";
import * as cs from "./LoadDemoDataButton.css.js";

export default function LoadDemoDataButton() {
  const intl = useIntl();
  const loadDemoData = useLoadDemoData();
  const queryClient = useQueryClient();

  const [hasDemoDataLoaded, setHasLoadedDemoData] = useLocalStorageItem(
    WellKnownKey.HasLoadedDemoData,
    false,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<LoadDemoDataProgress | null>(null);

  // Hide when demo data already loaded.
  if (hasDemoDataLoaded) {
    return null;
  }

  const handleLoadDemoData = async () => {
    if (!loadDemoData) {
      return;
    }
    try {
      setIsLoading(true);
      await loadDemoData(setProgress);
      queryClient.invalidateQueries();
      setHasLoadedDemoData(true);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        className={cs.LoadDemoDataButton.button}
        onPress={() => setIsModalOpen(true)}
      >
        {intl.formatMessage({ defaultMessage: "Load demo data" })}
      </Button>

      <ModalDialog
        isDismissable={!isLoading}
        isOpen={isModalOpen}
        onOpenChange={isLoading ? () => {} : setIsModalOpen}
        modalClassName={cs.LoadDemoDataButton.modal}
      >
        <ModalDialog.Heading>
          <FormattedMessage defaultMessage="Load demo data" />
        </ModalDialog.Heading>
        {isLoading ? (
          <ProgressBar
            value={progress?.current ?? 0}
            maxValue={progress?.total ?? 1}
            label={
              progress?.message ??
              intl.formatMessage({ defaultMessage: "Loading demo data" })
            }
            className={cs.LoadDemoDataButton.progressBar}
          />
        ) : (
          <>
            <p>
              <FormattedMessage defaultMessage="Loads some demo collections and documents for you to play around with." />
            </p>
            <Button variant="primary" onPress={handleLoadDemoData}>
              <FormattedMessage defaultMessage="Load" />
            </Button>
          </>
        )}
      </ModalDialog>
    </>
  );
}

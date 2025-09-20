import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogTrigger, Heading } from "react-aria-components";
import { PiPresentationChart, PiSpinner } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { LOCAL_STORAGE_KEYS } from "../../../config.js";
import Button from "../../design-system/Button/Button.jsx";
import IconButton from "../../design-system/IconButton/IconButton.js";
import Popover from "../../design-system/Popover/Popover.jsx";
import * as cs from "./LoadDemoDataButton.css.js";

interface Props {
  loadDemoData: () => Promise<void>;
}
export default function LoadDemoDataButton({ loadDemoData }: Props) {
  const intl = useIntl();
  const [hasDemoDataLoaded, setHasLoadedDemoData] = useState(
    localStorage.getItem(LOCAL_STORAGE_KEYS.hasLoadedDemoData) === "true",
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: loadDemoData,
    onSuccess() {
      queryClient.invalidateQueries();
      localStorage.setItem(LOCAL_STORAGE_KEYS.hasLoadedDemoData, "true");
      setHasLoadedDemoData(true);
    },
  });
  return !hasDemoDataLoaded ? (
    <DialogTrigger>
      <IconButton
        variant="primary"
        label={intl.formatMessage({ defaultMessage: "Load demo data" })}
        tooltipDelay={0}
        className={cs.LoadDemoDataButton.root}
        onPress={() => setIsPopoverOpen(true)}
      >
        {isPending ? <PiSpinner /> : <PiPresentationChart />}
      </IconButton>
      <Popover
        isOpen={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        className={cs.LoadDemoDataButton.popover}
      >
        <Dialog>
          <Heading className={cs.LoadDemoDataButton.heading}>
            <FormattedMessage defaultMessage="Load demo data" />
          </Heading>
          <p>
            <FormattedMessage defaultMessage="Loads some demo collections and documents for you to play around with." />
          </p>
          <p>
            <FormattedMessage defaultMessage="Attention: loading demo data erases all the data you've saved so far. Continue?" />
          </p>
          <Button
            variant="primary"
            onPress={() => {
              setIsPopoverOpen(false);
              mutateAsync();
            }}
          >
            <FormattedMessage defaultMessage="Yes, load" />
          </Button>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ) : null;
}

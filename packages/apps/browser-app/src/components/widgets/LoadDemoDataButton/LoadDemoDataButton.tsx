import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogTrigger, Heading } from "react-aria-components";
import { PiPresentationChart } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import useLocalStorageItem from "../../../business-logic/local-storage/useLocalStorageItem.js";
import WellKnownKey from "../../../business-logic/local-storage/WellKnownKey.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Button from "../../design-system/Button/Button.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import Popover from "../../design-system/Popover/Popover.js";
import * as cs from "./LoadDemoDataButton.css.js";

interface Props {
  loadDemoData: () => Promise<void>;
}
export default function LoadDemoDataButton({ loadDemoData }: Props) {
  const intl = useIntl();

  const { navigateTo } = useNavigationState();

  const [hasDemoDataLoaded, setHasLoadedDemoData] = useLocalStorageItem(
    WellKnownKey.HasLoadedDemoData,
    false,
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: loadDemoData,
    onSuccess() {
      queryClient.invalidateQueries();
      setHasLoadedDemoData(true);
    },
  });

  return (
    <DialogTrigger>
      <div className={cs.LoadDemoDataButton.root}>
        <IconButton
          variant="primary"
          label={
            !hasDemoDataLoaded
              ? intl.formatMessage({ defaultMessage: "Load demo data" })
              : intl.formatMessage({ defaultMessage: "Reset demo data" })
          }
          tooltipDelay={0}
          className={
            cs.LoadDemoDataButton.button[
              hasDemoDataLoaded && !isPopoverOpen ? "small" : "big"
            ]
          }
          onPress={() => setIsPopoverOpen(true)}
        >
          <PiPresentationChart />
        </IconButton>
      </div>
      <Popover
        isOpen={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        className={cs.LoadDemoDataButton.popover}
      >
        <Dialog>
          <Heading className={cs.LoadDemoDataButton.heading}>
            {!hasDemoDataLoaded ? (
              <FormattedMessage defaultMessage="Load demo data" />
            ) : (
              <FormattedMessage defaultMessage="Reset demo data" />
            )}
          </Heading>
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
              setIsPopoverOpen(false);
              setHasLoadedDemoData(true);
              navigateTo({ name: RouteName.Ask });
              // Since the mutation is CPU intensive and makes the CSS
              // transition stutter, we delay its execution.
              setTimeout(mutateAsync, 300);
            }}
          >
            {!hasDemoDataLoaded ? (
              <FormattedMessage defaultMessage="Yes, load" />
            ) : (
              <FormattedMessage defaultMessage="Yes, reset" />
            )}
          </Button>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

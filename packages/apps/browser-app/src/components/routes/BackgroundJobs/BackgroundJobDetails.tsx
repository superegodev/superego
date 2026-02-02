import type { BackgroundJob } from "@superego/backend";
import type { ReactNode } from "react";
import { PiArrowLeft } from "react-icons/pi";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getBackgroundJobQuery } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./BackgroundJobs.css.js";

interface Props {
  backgroundJobId: BackgroundJob["id"];
}
export default function BackgroundJobDetails({ backgroundJobId }: Props) {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Background job" })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Background job actions",
        })}
        actions={[
          {
            label: intl.formatMessage({
              defaultMessage: "Back to background jobs",
            }),
            icon: <PiArrowLeft />,
            to: { name: RouteName.BackgroundJobs },
          },
        ]}
      />
      <Shell.Panel.Content>
        <DataLoader queries={[getBackgroundJobQuery([backgroundJobId])]}>
          {(backgroundJob) => (
            <div className={cs.BackgroundJobs.details}>
              <DetailRow label={intl.formatMessage({ defaultMessage: "ID" })}>
                {backgroundJob.id}
              </DetailRow>
              <DetailRow label={intl.formatMessage({ defaultMessage: "Name" })}>
                {backgroundJob.name}
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Status" })}
              >
                {backgroundJob.status}
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Enqueued at" })}
              >
                <FormattedDate
                  value={backgroundJob.enqueuedAt}
                  dateStyle="medium"
                  timeStyle="short"
                />
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Started at" })}
              >
                {backgroundJob.startedProcessingAt ? (
                  <FormattedDate
                    value={backgroundJob.startedProcessingAt}
                    dateStyle="medium"
                    timeStyle="short"
                  />
                ) : (
                  <FormattedMessage defaultMessage="—" />
                )}
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Finished at" })}
              >
                {backgroundJob.finishedProcessingAt ? (
                  <FormattedDate
                    value={backgroundJob.finishedProcessingAt}
                    dateStyle="medium"
                    timeStyle="short"
                  />
                ) : (
                  <FormattedMessage defaultMessage="—" />
                )}
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Input" })}
              >
                <pre className={cs.BackgroundJobs.codeBlock}>
                  {JSON.stringify(backgroundJob.input, null, 2)}
                </pre>
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Error" })}
              >
                <pre className={cs.BackgroundJobs.codeBlock}>
                  {backgroundJob.error
                    ? JSON.stringify(backgroundJob.error, null, 2)
                    : intl.formatMessage({ defaultMessage: "None" })}
                </pre>
              </DetailRow>
            </div>
          )}
        </DataLoader>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
}
function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className={cs.BackgroundJobs.detailRow}>
      <div className={cs.BackgroundJobs.detailLabel}>{label}</div>
      <div className={cs.BackgroundJobs.detailValue}>{children}</div>
    </div>
  );
}

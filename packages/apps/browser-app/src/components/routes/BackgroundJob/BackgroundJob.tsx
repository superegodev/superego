import type { BackgroundJob as BackgroundJobB } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getBackgroundJobQuery } from "../../../business-logic/backend/hooks.js";
import BackgroundJobStatus from "../../design-system/BackgroundJobStatus/BackgroundJobStatus.js";
import CodeBlock from "../../design-system/CodeBlock/CodeBlock.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./BackgroundJob.css.js";
import DetailRow from "./DetailRow.js";

interface Props {
  backgroundJobId: BackgroundJobB["id"];
}
export default function BackgroundJob({ backgroundJobId }: Props) {
  const intl = useIntl();
  return (
    <DataLoader
      queries={[getBackgroundJobQuery([backgroundJobId])]}
      renderErrors={(errors) => (
        <RouteLevelErrors
          headerTitle={intl.formatMessage(
            {
              defaultMessage: "Error loading background job {backgroundJobId}",
            },
            { backgroundJobId },
          )}
          errors={errors}
        />
      )}
    >
      {(backgroundJob) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage({
              defaultMessage: "Background job details",
            })}
          />
          <Shell.Panel.Content>
            <dl>
              <DetailRow label={intl.formatMessage({ defaultMessage: "ID" })}>
                <pre>{backgroundJob.id}</pre>
              </DetailRow>
              <DetailRow label={intl.formatMessage({ defaultMessage: "Name" })}>
                <pre>{backgroundJob.name}</pre>
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Status" })}
              >
                <BackgroundJobStatus status={backgroundJob.status} />
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Enqueued at" })}
              >
                <pre>{backgroundJob.enqueuedAt.toISOString()}</pre>
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Started at" })}
              >
                <pre>
                  {backgroundJob.startedProcessingAt ? (
                    backgroundJob.startedProcessingAt.toISOString()
                  ) : (
                    <FormattedMessage defaultMessage="—" />
                  )}
                </pre>
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Finished at" })}
              >
                <pre>
                  {backgroundJob.finishedProcessingAt ? (
                    backgroundJob.finishedProcessingAt.toISOString()
                  ) : (
                    <FormattedMessage defaultMessage="—" />
                  )}
                </pre>
              </DetailRow>
              <DetailRow
                label={intl.formatMessage({ defaultMessage: "Input" })}
              >
                <CodeBlock
                  language="json"
                  code={JSON.stringify(backgroundJob.input)}
                  showCopyButton={true}
                  className={cs.BackgroundJob.codeBlock}
                />
              </DetailRow>
              {backgroundJob.error ? (
                <DetailRow
                  label={intl.formatMessage({ defaultMessage: "Error" })}
                >
                  <CodeBlock
                    language="json"
                    code={JSON.stringify(backgroundJob.error)}
                    showCopyButton={true}
                    className={cs.BackgroundJob.codeBlock}
                  />
                </DetailRow>
              ) : null}
            </dl>
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  );
}

import type { LiteBackgroundJob } from "@superego/backend";
import { FormattedDate, FormattedMessage } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import BackgroundJobStatus from "../../design-system/BackgroundJobStatus/BackgroundJobStatus.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  backgroundJob: LiteBackgroundJob;
  screenSize: ScreenSize;
}
export default function BackgroundJobTableRow({
  backgroundJob,
  screenSize,
}: Props) {
  return (
    <Table.Row
      href={toHref({
        name: RouteName.BackgroundJob,
        backgroundJobId: backgroundJob.id,
      })}
    >
      <Table.Cell>{backgroundJob.name}</Table.Cell>
      <Table.Cell align="center">
        <BackgroundJobStatus status={backgroundJob.status} />
      </Table.Cell>
      {screenSize > ScreenSize.Medium ? (
        <>
          <Table.Cell>
            <FormattedDate
              value={backgroundJob.enqueuedAt}
              dateStyle="short"
              timeStyle="medium"
            />
          </Table.Cell>
          <Table.Cell>
            {backgroundJob.startedProcessingAt ? (
              <FormattedDate
                value={backgroundJob.startedProcessingAt}
                dateStyle="short"
                timeStyle="medium"
              />
            ) : (
              <FormattedMessage defaultMessage="—" />
            )}
          </Table.Cell>
          <Table.Cell>
            {backgroundJob.finishedProcessingAt ? (
              <FormattedDate
                value={backgroundJob.finishedProcessingAt}
                dateStyle="short"
                timeStyle="medium"
              />
            ) : (
              <FormattedMessage defaultMessage="—" />
            )}
          </Table.Cell>
        </>
      ) : null}
    </Table.Row>
  );
}

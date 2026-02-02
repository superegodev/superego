import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { listBackgroundJobsQuery } from "../../../business-logic/backend/hooks.js";
import Shell from "../../design-system/Shell/Shell.js";
import BackgroundJobsTable from "../../widgets/BackgroundJobsTable/BackgroundJobsTable.js";

export default function BackgroundJobs() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Background jobs" })}
      />
      <Shell.Panel.Content fullWidth={true}>
        <DataLoader queries={[listBackgroundJobsQuery([])]}>
          {(backgroundJobs) => (
            <BackgroundJobsTable
              backgroundJobs={backgroundJobs}
              pageSize="max"
            />
          )}
        </DataLoader>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}

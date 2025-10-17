import type { Backend } from "@superego/backend";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, useLocale } from "react-aria-components";
import { FormattedMessage, IntlProvider } from "react-intl";
import DataLoader from "./business-logic/backend/DataLoader.js";
import { GlobalDataProvider } from "./business-logic/backend/GlobalData.js";
import {
  getDeveloperPromptsQuery,
  getGlobalSettingsQuery,
  listCollectionCategoriesQuery,
  listCollectionsQuery,
  listConnectorsQuery,
} from "./business-logic/backend/hooks.js";
import { BackendProvider } from "./business-logic/backend/useBackend.js";
import { fromHref } from "./business-logic/navigation/RouteUtils.js";
import useNavigationState from "./business-logic/navigation/useNavigationState.js";
import ResultErrors from "./components/design-system/ResultErrors/ResultErrors.js";
import Root from "./components/routes/Root/Root.js";
import messages from "./translations/compiled/en.json" with { type: "json" };
import "./BrowserApp.css.js";
import LoadDemoDataProvider from "./business-logic/load-demo-data/LoadDemoDataProvider.js";
import ScreenSizeProvider from "./business-logic/screen-size/ScreenSizeProvider.js";

interface Props {
  backend: Backend;
  queryClient: QueryClient;
  loadDemoData?: () => Promise<void>;
}
export default function BrowserApp({
  backend,
  queryClient,
  loadDemoData,
}: Props) {
  const { locale } = useLocale();
  const { navigateTo } = useNavigationState();
  return (
    <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      <BackendProvider backend={backend}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider navigate={(href) => navigateTo(fromHref(href))}>
            <ScreenSizeProvider>
              <DataLoader
                queries={[
                  listCollectionCategoriesQuery([]),
                  listCollectionsQuery([]),
                  listConnectorsQuery([]),
                  getGlobalSettingsQuery([]),
                  getDeveloperPromptsQuery([]),
                ]}
                renderErrors={(errors) => (
                  <>
                    <h1>
                      <FormattedMessage defaultMessage="Error loading app" />
                    </h1>
                    <ResultErrors errors={errors} />
                  </>
                )}
              >
                {(
                  collectionCategories,
                  collections,
                  connectors,
                  globalSettings,
                  developerPrompts,
                ) => (
                  <GlobalDataProvider
                    value={{
                      collectionCategories,
                      collections,
                      connectors,
                      globalSettings,
                      developerPrompts,
                    }}
                  >
                    {import.meta.env["VITE_IS_DEMO"] === "true" ? (
                      <LoadDemoDataProvider value={loadDemoData}>
                        <Root />
                      </LoadDemoDataProvider>
                    ) : (
                      <Root />
                    )}
                  </GlobalDataProvider>
                )}
              </DataLoader>
            </ScreenSizeProvider>
          </RouterProvider>
        </QueryClientProvider>
      </BackendProvider>
    </IntlProvider>
  );
}

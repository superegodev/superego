import type { Backend } from "@superego/backend";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { RouterProvider, useLocale } from "react-aria-components";
import { FormattedMessage, IntlProvider } from "react-intl";
import DataLoader from "./business-logic/backend/DataLoader.js";
import { GlobalDataProvider } from "./business-logic/backend/GlobalData.js";
import {
  getDeveloperPromptsQuery,
  getGlobalSettingsQuery,
  listCollectionCategoriesQuery,
  listCollectionsQuery,
} from "./business-logic/backend/hooks.js";
import { BackendProvider } from "./business-logic/backend/useBackend.js";
import { fromHref } from "./business-logic/navigation/RouteUtils.js";
import useNavigationState from "./business-logic/navigation/useNavigationState.js";
import ResultError from "./components/design-system/ResultError/ResultError.js";
import Root from "./components/routes/Root/Root.js";
import messages from "./translations/compiled/en.json" with { type: "json" };

import "./setupMonacoEditor.js";
import "./BrowserApp.css.js";

interface Props {
  backend: Backend;
  queryClient: QueryClient;
}
export default function BrowserApp({ backend, queryClient }: Props) {
  const { locale } = useLocale();
  const { navigateTo } = useNavigationState();
  return (
    <StrictMode>
      <IntlProvider messages={messages} locale={locale} defaultLocale="en">
        <BackendProvider backend={backend}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider navigate={(href) => navigateTo(fromHref(href))}>
              <DataLoader
                queries={[
                  listCollectionCategoriesQuery([]),
                  listCollectionsQuery([]),
                  getGlobalSettingsQuery([]),
                  getDeveloperPromptsQuery([]),
                ]}
                renderErrors={(errors) => (
                  <>
                    <FormattedMessage defaultMessage="Error loading app" />
                    <ResultError errors={errors} />
                  </>
                )}
              >
                {(
                  collectionCategories,
                  collections,
                  globalSettings,
                  developerPrompts,
                ) => (
                  <GlobalDataProvider
                    value={{
                      collectionCategories,
                      collections,
                      globalSettings,
                      developerPrompts,
                    }}
                  >
                    <Root />
                  </GlobalDataProvider>
                )}
              </DataLoader>
            </RouterProvider>
          </QueryClientProvider>
        </BackendProvider>
      </IntlProvider>
    </StrictMode>
  );
}

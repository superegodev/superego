import "./Sandbox.css.js";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type SandboxIpc from "../../ipc/SandboxIpc.js";
import type Backend from "../business-logic/backend/Backend.js";
import { BackendProvider } from "../business-logic/backend/useBackend.js";
import { HostNavigationProvider } from "../business-logic/host-navigation/useNavigateHostTo.js";
import IntlMessagesContext from "../business-logic/intl-messages/IntlMessagesContext.js";
import SettingsContext from "../business-logic/settings/SettingsContext.js";
import useApplyTheme from "../business-logic/theme/useApplyTheme.js";
import AppErrorBoundary from "./AppErrorBoundary.js";
import AppImportingError from "./AppImportingError.js";
import useAppRenderingParams from "./useAppRenderingParams.js";

interface Props {
  sandboxIpc: SandboxIpc;
  backend: Backend;
  queryClient: QueryClient;
}
export default function Sandbox({ sandboxIpc, backend, queryClient }: Props) {
  const appRenderingParams = useAppRenderingParams(sandboxIpc);

  useApplyTheme(appRenderingParams?.settings.theme);

  if (!appRenderingParams) {
    return null;
  }

  const { appProps, settings, intlMessages, App, appImportingError } =
    appRenderingParams;

  if (!App) {
    return (
      <AppImportingError
        title={intlMessages.global.appImportingError}
        error={appImportingError}
      />
    );
  }

  return (
    <HostNavigationProvider sandboxIpc={sandboxIpc}>
      <BackendProvider backend={backend}>
        <QueryClientProvider client={queryClient}>
          <SettingsContext.Provider value={settings}>
            <IntlMessagesContext.Provider value={intlMessages}>
              <AppErrorBoundary title={intlMessages.global.appRenderingError}>
                <App {...appProps} />
              </AppErrorBoundary>
            </IntlMessagesContext.Provider>
          </SettingsContext.Provider>
        </QueryClientProvider>
      </BackendProvider>
    </HostNavigationProvider>
  );
}

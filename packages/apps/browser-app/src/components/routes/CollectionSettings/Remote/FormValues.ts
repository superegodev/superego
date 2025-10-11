import type {
  ConnectorAuthenticationSettings,
  TypescriptModule,
} from "@superego/backend";

export default interface FormValues {
  connectorAuthenticationSettings: ConnectorAuthenticationSettings;
  connectorSettings: any;
  remoteConverters: {
    fromRemoteDocument: TypescriptModule;
  };
}

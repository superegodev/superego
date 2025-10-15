import type {
  ConnectorAuthenticationSettings,
  RemoteConverters,
} from "@superego/backend";

export default interface FormValues {
  connectorAuthenticationSettings: ConnectorAuthenticationSettings;
  connectorSettings: any;
  remoteConverters: RemoteConverters;
}

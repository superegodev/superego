export default interface AppState<Content = Record<string, unknown>> {
  content: Content;
  revision: number;
}

export default interface AppState<Content = any> {
  content: Content;
  revision: number;
}

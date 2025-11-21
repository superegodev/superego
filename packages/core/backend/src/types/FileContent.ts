export default interface FileContent {
  name: string;
  content: Uint8Array<ArrayBuffer>;
  contentType: string;
}

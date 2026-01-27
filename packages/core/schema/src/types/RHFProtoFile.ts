/**
 * RHF representation of a ProtoFile. ProtoFile cannot be used directly because
 * RHF doesn't play well with ArrayBuffers.
 * See https://github.com/react-hook-form/react-hook-form/pull/12809.
 */
export default interface RHFProtoFile {
  name: string;
  mimeType: string;
  content: File;
}

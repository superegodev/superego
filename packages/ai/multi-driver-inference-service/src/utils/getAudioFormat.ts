export default function getAudioFormat(contentType: string): string {
  const baseType = contentType.split(";")[0]!.trim().toLowerCase();
  switch (baseType) {
    case "audio/mpeg":
    case "audio/mpga":
    case "audio/mp3":
      return "mp3";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    case "audio/mp4":
      return "mp4";
    case "audio/webm":
      return "webm";
    case "audio/ogg":
      return "ogg";
    case "audio/flac":
      return "flac";
    default:
      throw new Error(`Unsupported audio format: ${baseType}`);
  }
}

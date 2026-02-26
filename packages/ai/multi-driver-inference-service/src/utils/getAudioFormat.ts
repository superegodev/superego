export default function getAudioFormat(contentType: string): "mp3" | "wav" {
  const baseType = contentType.split(";")[0]!.trim();
  if (
    baseType === "audio/mpeg" ||
    baseType === "audio/mpga" ||
    baseType === "audio/mp3"
  ) {
    return "mp3";
  }
  return "wav";
}

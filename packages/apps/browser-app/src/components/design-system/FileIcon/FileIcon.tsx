import {
  PiFile,
  PiFileArchive,
  PiFileAudio,
  PiFileImage,
  PiFilePdf,
  PiFileText,
  PiFileVideo,
} from "react-icons/pi";

interface Props {
  mimeType: string;
}
export default function FileIcon({ mimeType }: Props) {
  switch (true) {
    case mimeType.startsWith("text"):
      return <PiFileText />;
    case mimeType.startsWith("audio"):
      return <PiFileAudio />;
    case mimeType.startsWith("image"):
      return <PiFileImage />;
    case mimeType.startsWith("video"):
      return <PiFileVideo />;
    case mimeType === "application/pdf":
      return <PiFilePdf />;
    case mimeType.includes("zip") ||
      mimeType.includes("tar") ||
      mimeType.includes("gzip") ||
      mimeType.includes("rar"):
      return <PiFileArchive />;
    default:
      return <PiFile />;
  }
}

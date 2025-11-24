import {
  type MessageContentPart,
  MessageContentPartType,
} from "@superego/backend";
import pMap from "p-map";
import { type ClipboardEventHandler, useState } from "react";
import type { DropEvent } from "react-aria";

interface UseFiles {
  files: File[];
  onDrop: (evt: DropEvent) => void;
  onPaste: ClipboardEventHandler<HTMLInputElement>;
  onFilesAdded: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  getContentParts: () => Promise<MessageContentPart.File[]>;
  removeAllFiles: () => void;
}
export default function useFiles(isEnabled: boolean): UseFiles {
  const [files, setFiles] = useState<File[]>([]);
  const addFiles = async (addedFiles: File[]) => {
    setFiles((currentFiles) => [...currentFiles, ...addedFiles]);
  };
  return {
    files: files,
    onDrop: async ({ items }) => {
      if (!isEnabled) {
        return;
      }
      const droppedFiles: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          droppedFiles.push(await item.getFile());
        }
      }
      addFiles(droppedFiles);
    },
    onPaste: (evt) => {
      if (!isEnabled) {
        return;
      }
      const pastedFiles: File[] = [];
      for (const item of evt.clipboardData?.items ?? []) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }
      addFiles(pastedFiles);
    },
    onFilesAdded: (files) => {
      if (!isEnabled) {
        return;
      }
      addFiles([...files]);
    },
    onRemoveFile: (index) =>
      setFiles((currentFiles) => currentFiles.toSpliced(index, 1)),
    getContentParts: () =>
      pMap(files, async (file) => ({
        type: MessageContentPartType.File,
        file: {
          name: file.name,
          content: new Uint8Array(await file.arrayBuffer()),
          mimeType: file.type,
        },
      })),
    removeAllFiles: () => setFiles([]),
  };
}

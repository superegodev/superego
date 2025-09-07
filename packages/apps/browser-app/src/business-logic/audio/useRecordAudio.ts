import type { AudioContent } from "@superego/backend";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseRecordAudio {
  isRecording: boolean;
  startRecording: () => void;
  finishRecording: () => void;
  cancelRecording: () => void;
}
export default function useRecordAudio(
  onFinish: (audio: AudioContent) => void,
  audioBitsPerSecond = 16_000,
): UseRecordAudio {
  const [isRecording, setIsRecording] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const hasCanceledRef = useRef(false);

  // Cleanup on unmount.
  useEffect(() => {
    return () => cleanup(mediaStreamRef, mediaRecorderRef, hasCanceledRef);
  }, []);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream, { audioBitsPerSecond });
    mediaRecorderRef.current = mediaRecorder;

    let recordedChunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (evt) => {
      if (evt.data && evt.data.size > 0) {
        recordedChunks.push(evt.data);
      }
    };

    mediaRecorder.onstop = async () => {
      if (hasCanceledRef.current) {
        recordedChunks = [];
        hasCanceledRef.current = false;
        return;
      }

      try {
        const chunksBlob = new Blob(recordedChunks, {
          type: mediaRecorder.mimeType,
        });
        onFinish({
          content: new Uint8Array(await chunksBlob.arrayBuffer()),
          contentType: mediaRecorder.mimeType,
        });
      } finally {
        cleanup(mediaStreamRef, mediaRecorderRef, hasCanceledRef);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, [onFinish, audioBitsPerSecond]);

  const finishRecording = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    setIsRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    try {
      hasCanceledRef.current = true;
      mediaRecorderRef.current?.stop();
    } catch {}
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, finishRecording, cancelRecording };
}

function cleanup(
  mediaStreamRef: RefObject<MediaStream | null>,
  mediaRecorderRef: RefObject<MediaRecorder | null>,
  hasCanceledRef: RefObject<boolean>,
) {
  hasCanceledRef.current = false;
  try {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
  } catch {}
  mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
}

import type { AudioContent } from "@superego/backend";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UsePlayAudio {
  isPlaying: boolean;
  togglePlayback: () => void;
}
export default function usePlayAudio(
  audioContent: AudioContent | undefined | null,
): UsePlayAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup on unmount.
  useEffect(() => {
    return () => cleanup(audioRef, audioUrlRef);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioContent) {
      return;
    }
    if (!audioRef.current) {
      audioUrlRef.current = URL.createObjectURL(
        new Blob([audioContent.content], { type: audioContent.contentType }),
      );
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        cleanup(audioRef, audioUrlRef);
      };
    }
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [audioContent]);

  return { isPlaying, togglePlayback };
}

function cleanup(
  audioRef: RefObject<HTMLAudioElement | null>,
  audioUrlRef: RefObject<string | null>,
) {
  if (audioRef.current) {
    audioRef.current.onplay = null;
    audioRef.current.onpause = null;
    audioRef.current.onended = null;
    audioRef.current = null;
  }
  if (audioUrlRef.current) {
    URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
  }
}

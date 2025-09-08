import { useGlobalData } from "../backend/GlobalData.js";

interface UseIsInferenceConfigured {
  completions: boolean;
  transcriptions: boolean;
  speech: boolean;
}
export default function useIsInferenceConfigured(): UseIsInferenceConfigured {
  const { inference } = useGlobalData().globalSettings;
  return {
    completions: Boolean(
      inference.completions.model && inference.completions.provider.baseUrl,
    ),
    transcriptions: Boolean(
      inference.transcriptions.model &&
        inference.transcriptions.provider.baseUrl,
    ),
    speech: Boolean(
      inference.speech.model &&
        inference.speech.voice &&
        inference.speech.provider.baseUrl,
    ),
  };
}

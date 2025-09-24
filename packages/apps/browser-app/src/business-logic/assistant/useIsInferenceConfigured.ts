import { useGlobalData } from "../backend/GlobalData.js";

interface UseIsInferenceConfigured {
  chatCompletions: boolean;
  transcriptions: boolean;
  speech: boolean;
}
export default function useIsInferenceConfigured(): UseIsInferenceConfigured {
  const { inference } = useGlobalData().globalSettings;
  return {
    chatCompletions: Boolean(
      inference.chatCompletions.model &&
        inference.chatCompletions.provider.baseUrl,
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

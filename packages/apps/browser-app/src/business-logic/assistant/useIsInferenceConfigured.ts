import { useGlobalData } from "../backend/GlobalData.js";

interface UseIsInferenceConfigured {
  chatCompletions: boolean;
  transcriptions: boolean;
  fileInspection: boolean;
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
    fileInspection: Boolean(
      inference.fileInspection.model &&
        inference.fileInspection.provider.baseUrl,
    ),
  };
}

import { useGlobalData } from "../backend/GlobalData.js";

interface UseIsInferenceConfigured {
  chatCompletions: boolean;
}
export default function useIsInferenceConfigured(): UseIsInferenceConfigured {
  const { inference } = useGlobalData().globalSettings;
  return {
    chatCompletions: Boolean(
      inference.chatCompletions.model &&
        inference.chatCompletions.provider.baseUrl,
    ),
  };
}

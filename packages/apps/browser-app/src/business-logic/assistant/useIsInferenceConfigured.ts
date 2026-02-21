import { useGlobalData } from "../backend/GlobalData.js";

// TODO_AI:
// - when the input is overhauled, we probably need to extract more info here
//   (e.g., hasAudioCapableModel, etc).
// - chatCompletions definitely needs to be renamed
interface UseIsInferenceConfigured {
  chatCompletions: boolean;
}
export default function useIsInferenceConfigured(): UseIsInferenceConfigured {
  const { inference } = useGlobalData().globalSettings;
  return {
    chatCompletions: Boolean(inference.defaultChatModel),
  };
}

import { useGlobalData } from "../backend/GlobalData.js";

// TODO_AI:
// - when the input is overhauled, we probably need to extract more info here
//   (e.g., hasAudioCapableModel, etc).
interface UseIsInferenceConfigured {
  completion: boolean;
}
export default function useIsInferenceConfigured(): UseIsInferenceConfigured {
  const { inference } = useGlobalData().globalSettings;
  return {
    completion: Boolean(inference.defaults.completion),
  };
}

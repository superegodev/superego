export default interface InferenceSettings {
  completions: {
    provider: {
      baseUrl: string | null;
      apiKey: string | null;
    };
    model: string | null;
  };
  transcriptions: {
    provider: {
      baseUrl: string | null;
      apiKey: string | null;
    };
    model: string | null;
  };
  speech: {
    provider: {
      baseUrl: string | null;
      apiKey: string | null;
    };
    model: string | null;
    voice: string | null;
  };
}

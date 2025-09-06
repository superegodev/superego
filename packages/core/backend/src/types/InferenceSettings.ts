export default interface InferenceSettings {
  completions: {
    provider: {
      baseUrl: string | null;
      apiKey: string | null;
    };
    model: string | null;
  };
}

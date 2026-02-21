export default interface InferenceSettings {
  chatCompletions: {
    provider: {
      baseUrl: string | null;
      apiKey: string | null;
    };
    model: string | null;
  };
}

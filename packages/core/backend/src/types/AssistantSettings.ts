export default interface AssistantSettings {
  completions: {
    provider: {
      baseUrl: string | null;
      apiKey: string | null;
    };
    model: string | null;
  };
  developerPrompt: string | null;
}

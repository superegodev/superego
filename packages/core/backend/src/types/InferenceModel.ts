export default interface InferenceModel {
  id: string;
  name: string;
  capabilities: {
    reasoning: boolean;
    audioUnderstanding: boolean;
    imageUnderstanding: boolean;
    pdfUnderstanding: boolean;
    webSearching: boolean;
  };
}

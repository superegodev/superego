export default interface InferenceModel {
  name: string;
  capabilities: {
    reasoning: boolean;
    audioUnderstanding: boolean;
    imageUnderstanding: boolean;
    pdfUnderstanding: boolean;
    webSearching: boolean;
  };
}

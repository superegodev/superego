export default interface InferenceModel {
  id: string;
  name: string;
  capabilities: {
    audioUnderstanding: boolean;
    imageUnderstanding: boolean;
    pdfUnderstanding: boolean;
    webSearching: boolean;
  };
}

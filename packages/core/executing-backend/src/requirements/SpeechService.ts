interface SpeechService {
  transcribe(audio: SpeechService.Audio): Promise<string>;

  synthesize(text: string): Promise<SpeechService.Audio>;
}
namespace SpeechService {
  export interface Audio {
    content: Uint8Array<ArrayBuffer>;
    contentType: "audio/wav";
  }
}
export default SpeechService;

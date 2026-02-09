import type { LitePack, Pack } from "@superego/backend";

export default function makeLitePack(pack: Pack): LitePack {
  const { id, info } = pack;
  const [firstScreenshot] = info.screenshots;
  return {
    id,
    info: {
      ...info,
      screenshots: firstScreenshot ? [firstScreenshot] : [],
    },
  };
}

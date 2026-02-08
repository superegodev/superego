import type { LitePack, Pack } from "@superego/backend";

export default function makeLitePack(pack: Pack): LitePack {
  const { id, info } = pack;
  const [firstImage] = info.images;
  return {
    id,
    info: {
      ...info,
      images: firstImage ? [firstImage] : [],
    },
  };
}

import { type LitePack, type Pack, Theme } from "@superego/backend";

export default function makeLitePack(pack: Pack): LitePack {
  const { id, info } = pack;
  let light: LitePack["info"]["screenshots"][number] | undefined;
  let dark: LitePack["info"]["screenshots"][number] | undefined;
  for (const screenshot of info.screenshots) {
    if (!light && screenshot.theme === Theme.Light) {
      light = screenshot;
    } else if (!dark && screenshot.theme === Theme.Dark) {
      dark = screenshot;
    }
    if (light && dark) {
      break;
    }
  }
  const screenshots = [light, dark].filter(
    (screenshot) => screenshot !== undefined,
  );
  return {
    id,
    info: {
      ...info,
      screenshots,
    },
  };
}

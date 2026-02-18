import type { Pack, PackId } from "@superego/backend";
import { create } from "zustand";

interface UsePackStore {
  packs: Map<PackId, Pack>;
  setPack(pack: Pack): void;
  clearPack(packId: PackId): void;
  getPack(packId: PackId): Pack | undefined;
}

export default create<UsePackStore>((set, get) => ({
  packs: new Map(),
  setPack(pack) {
    set((state) => {
      const packs = new Map(state.packs);
      packs.set(pack.id, pack);
      return { packs };
    });
  },
  clearPack(packId) {
    set((state) => {
      const packs = new Map(state.packs);
      packs.delete(packId);
      return { packs };
    });
  },
  getPack(packId) {
    return get().packs.get(packId);
  },
}));

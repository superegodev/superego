import type ProtoFile from "../types/ProtoFile.js";
import type RHFProtoFile from "../types/RHFProtoFile.js";

export default {
  toRHFProtoFile(protoFile: ProtoFile): RHFProtoFile {
    return {
      name: protoFile.name,
      mimeType: protoFile.mimeType,
      content: new File([protoFile.content], protoFile.name, {
        type: protoFile.mimeType,
      }),
    };
  },

  async fromRHFProtoFile(rhfProtoFile: RHFProtoFile): Promise<ProtoFile> {
    return {
      name: rhfProtoFile.name,
      mimeType: rhfProtoFile.mimeType,
      content: new Uint8Array(await rhfProtoFile.content.arrayBuffer()),
    };
  },
};

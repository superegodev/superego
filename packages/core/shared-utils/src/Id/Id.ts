import baseX from "base-x";
import { v7 } from "uuid";
import base58Alphabet from "../utils/base58Alphabet.js";

const bs58 = baseX(base58Alphabet);

export default {
  generate: {
    collectionCategory: makeGenerateId("CollectionCategory"),
    collection: makeGenerateId("Collection"),
    collectionVersion: makeGenerateId("CollectionVersion"),
    document: makeGenerateId("Document"),
    documentVersion: makeGenerateId("DocumentVersion"),
    file: makeGenerateId("File"),
    conversation: makeGenerateId("Conversation"),
    app: makeGenerateId("App"),
    appVersion: makeGenerateId("AppVersion"),
    backgroundJob: makeGenerateId("BackgroundJob"),
    protoCollection: makeGenerateProtoId("ProtoCollection"),
    protoDocument: makeGenerateProtoId("ProtoDocument"),
    protoApp: makeGenerateProtoId("ProtoApp"),
  },

  is: {
    collectionCategory: makeIsId("CollectionCategory"),
    collection: makeIsId("Collection"),
    collectionVersion: makeIsId("CollectionVersion"),
    document: makeIsId("Document"),
    documentVersion: makeIsId("DocumentVersion"),
    file: makeIsId("File"),
    conversation: makeIsId("Conversation"),
    app: makeIsId("App"),
    appVersion: makeIsId("AppVersion"),
    backgroundJob: makeIsId("BackgroundJob"),
    pack: makeIsPackId(),
    protoCollection: makeIsProtoId("ProtoCollection"),
    protoDocument: makeIsProtoId("ProtoDocument"),
    protoApp: makeIsProtoId("ProtoApp"),
  },
};

function makeGenerateId<Prefix extends string>(prefix: Prefix) {
  return (): `${Prefix}_${string}` =>
    `${prefix}_${bs58.encode(v7(undefined, new Uint8Array(16)))}`;
}

function makeIsId<Prefix extends string>(prefix: Prefix) {
  return (value: unknown): value is `${Prefix}_${string}` =>
    typeof value === "string" &&
    new RegExp(`^${prefix}_[${base58Alphabet}]{21}$`).test(value);
}

function makeGenerateProtoId<Prefix extends string>(prefix: Prefix) {
  return (index: number): `${Prefix}_${number}` => `${prefix}_${index}`;
}

function makeIsProtoId<Prefix extends string>(prefix: Prefix) {
  return (value: unknown): value is `${Prefix}_${number}` =>
    typeof value === "string" && new RegExp(`^${prefix}_\\d+$`).test(value);
}

/**
 * Pack IDs use reverse domain name notation: Pack_com.example.mypack
 */
function makeIsPackId() {
  return (value: unknown): value is `Pack_${string}` =>
    typeof value === "string" && /^Pack_[a-z0-9]+(\.[a-z0-9]+)+$/.test(value);
}

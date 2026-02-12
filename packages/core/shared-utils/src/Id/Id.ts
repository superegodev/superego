import baseX from "base-x";
import { v7 } from "uuid";
import base58Alphabet from "../utils/base58Alphabet.js";

const bs58 = baseX(base58Alphabet);

const Id = {
  generate: {
    protoCollectionCategory: makeGenerateProtoId("ProtoCollectionCategory"),
    protoCollection: makeGenerateProtoId("ProtoCollection"),
    collectionCategory: makeGenerateId("CollectionCategory"),
    collection: makeGenerateId("Collection"),
    collectionVersion: makeGenerateId("CollectionVersion"),
    protoDocument: makeGenerateProtoId("ProtoDocument"),
    document: makeGenerateId("Document"),
    documentVersion: makeGenerateId("DocumentVersion"),
    file: makeGenerateId("File"),
    conversation: makeGenerateId("Conversation"),
    protoApp: makeGenerateProtoId("ProtoApp"),
    app: makeGenerateId("App"),
    appVersion: makeGenerateId("AppVersion"),
    backgroundJob: makeGenerateId("BackgroundJob"),
  },

  is: {
    protoCollectionCategory: makeIsProtoId("ProtoCollectionCategory"),
    collectionCategory: makeIsId("CollectionCategory"),
    protoCollection: makeIsProtoId("ProtoCollection"),
    collection: makeIsId("Collection"),
    collectionVersion: makeIsId("CollectionVersion"),
    protoDocument: makeIsProtoId("ProtoDocument"),
    document: makeIsId("Document"),
    documentVersion: makeIsId("DocumentVersion"),
    file: makeIsId("File"),
    conversation: makeIsId("Conversation"),
    protoApp: makeIsProtoId("ProtoApp"),
    app: makeIsId("App"),
    appVersion: makeIsId("AppVersion"),
    backgroundJob: makeIsId("BackgroundJob"),
  },

  extractIndex: {
    protoCollectionCategory: makeExtractIndex("ProtoCollectionCategory"),
    protoCollection: makeExtractIndex("ProtoCollection"),
    protoDocument: makeExtractIndex("ProtoDocument"),
    protoApp: makeExtractIndex("ProtoApp"),
  },
};
export default Id;

function makeGenerateId<Prefix extends string>(prefix: Prefix) {
  return (): `${Prefix}_${string}` =>
    `${prefix}_${bs58.encode(v7(undefined, new Uint8Array(16)))}`;
}

function makeGenerateProtoId<Prefix extends string>(prefix: Prefix) {
  return (index: number): `${Prefix}_${number}` => `${prefix}_${index}`;
}

function makeIsId<Prefix extends string>(prefix: Prefix) {
  return (value: unknown): value is `${Prefix}_${string}` =>
    typeof value === "string" &&
    new RegExp(`^${prefix}_[${base58Alphabet}]{21}$`).test(value);
}

function makeIsProtoId<Prefix extends string>(prefix: Prefix) {
  return (value: unknown): value is `${Prefix}_${number}` =>
    typeof value === "string" && new RegExp(`^${prefix}_\\d+$`).test(value);
}

function makeExtractIndex<Prefix extends string>(prefix: Prefix) {
  return (id: `${Prefix}_${number}`): number | null => {
    const indexString = id.slice(`${prefix}_`.length);
    const index = Number.parseInt(indexString, 10);
    return !Number.isNaN(index) && index >= 0 ? index : null;
  };
}

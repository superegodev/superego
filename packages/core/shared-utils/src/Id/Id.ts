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
    backgroundJob: makeGenerateId("BackgroundJob"),
  },

  is: {
    collectionCategory: makeIsId("CollectionCategory"),
    collection: makeIsId("Collection"),
    collectionVersion: makeIsId("CollectionVersion"),
    document: makeIsId("Document"),
    documentVersion: makeIsId("DocumentVersion"),
    file: makeIsId("File"),
    conversation: makeIsId("Conversation"),
    backgroundJob: makeIsId("BackgroundJob"),
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

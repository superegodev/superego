import type { CollectionId } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import { OAuth2PKCEInvalidStateParam } from "./errors.js";

export interface UrlState {
  collectionId: CollectionId;
  nonce: string;
}

export default {
  parse(stateParam: string | null): UrlState {
    if (stateParam === null) {
      throw new OAuth2PKCEInvalidStateParam("state param is not defined");
    }

    let urlState: any;
    try {
      urlState = JSON.parse(stateParam);
    } catch {
      throw new OAuth2PKCEInvalidStateParam("state param is not valid JSON");
    }

    const { success, output: validUrlState } = v.safeParse(
      v.object({
        collectionId: valibotSchemas.id.collection(),
        nonce: v.string(),
      }),
      urlState,
    );
    if (!success) {
      throw new OAuth2PKCEInvalidStateParam("state param doesn't match schema");
    }
    return validUrlState;
  },

  stringify(urlState: UrlState): string {
    return JSON.stringify(urlState);
  },
};

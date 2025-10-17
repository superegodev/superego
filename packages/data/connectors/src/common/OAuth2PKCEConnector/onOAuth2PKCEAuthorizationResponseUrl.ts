import type {
  Backend,
  Collection,
  CollectionHasNoRemote,
  CollectionId,
  CollectionNotFound,
  ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy,
  UnexpectedError,
} from "@superego/backend";
import type { ResultError, ResultPromise } from "@superego/global-types";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import type { OAuth2PKCEInvalidStateParam } from "./errors.js";
import UrlState from "./UrlState.js";

export default async function onOAuth2PKCEAuthorizationResponseUrl(
  backend: Backend,
  authorizationResponseUrl: string,
): ResultPromise<
  Collection,
  | ResultError<
      "OAuth2PKCEInvalidStateParam",
      { reason: string; authorizationResponseUrl: string }
    >
  | CollectionNotFound
  | CollectionHasNoRemote
  | ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy
  | UnexpectedError
> {
  let collectionId: CollectionId;
  try {
    const stateParam = new URL(authorizationResponseUrl).searchParams.get(
      "state",
    );
    ({ collectionId } = UrlState.parse(stateParam));
  } catch (error: unknown) {
    return makeUnsuccessfulResult({
      name: "OAuth2PKCEInvalidStateParam",
      details: {
        reason: (error as OAuth2PKCEInvalidStateParam).message,
        authorizationResponseUrl: authorizationResponseUrl,
      },
    });
  }

  return backend.collections.authenticateOAuth2PKCEConnector(
    collectionId,
    authorizationResponseUrl,
  );
}

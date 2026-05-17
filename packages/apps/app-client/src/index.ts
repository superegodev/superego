import type {
  AppComponentProps,
  IntlMessages,
  Settings,
} from "@superego/app-sandbox/types";
import type {
  Backend,
  CollectionId,
  DocumentDefinition,
  DocumentId,
  DocumentVersionId,
  FileId,
} from "@superego/backend";
import type { Result, ResultPromise } from "@superego/global-types";

export interface SuperegoClient {
  appProps: AppComponentProps;
  collections: AppComponentProps["collections"];
  settings: Settings;
  intlMessages: IntlMessages;
  documents: {
    create: Backend["documents"]["create"];
    createNewVersion: Backend["documents"]["createNewVersion"];
    delete(
      collectionId: CollectionId,
      documentId: DocumentId,
    ): ResultPromise<null, any>;
  };
  files: {
    getContent: Backend["files"]["getContent"];
  };
  navigateTo(href: string): void;
}

type HostMessage =
  | {
      sender: "Host";
      type: "RenderApp";
      payload: {
        appProps: AppComponentProps;
        settings: Settings;
        intlMessages: IntlMessages;
      };
    }
  | {
      sender: "Host";
      type: "RespondToBackendMethodInvocation";
      payload: {
        invocationId: string;
        result: Result<any, any>;
      };
    };

const invocations = new Map<string, (result: Result<any, any>) => void>();
let responseListenerRegistered = false;

export async function connectSuperego(): Promise<SuperegoClient> {
  ensureResponseListener();
  const renderPayload = await waitForRenderPayload();
  return {
    appProps: renderPayload.appProps,
    collections: renderPayload.appProps.collections,
    settings: renderPayload.settings,
    intlMessages: renderPayload.intlMessages,
    documents: {
      create(definition: DocumentDefinition) {
        return invokeBackendMethod("documents", "create", [definition]);
      },
      createNewVersion(
        collectionId: CollectionId,
        documentId: DocumentId,
        latestVersionId: DocumentVersionId,
        content: any,
      ) {
        return invokeBackendMethod("documents", "createNewVersion", [
          collectionId,
          documentId,
          latestVersionId,
          content,
        ]);
      },
      delete(collectionId: CollectionId, documentId: DocumentId) {
        return invokeBackendMethod("documents", "delete", [
          collectionId,
          documentId,
        ]);
      },
    },
    files: {
      getContent(id: FileId) {
        return invokeBackendMethod("files", "getContent", [id]);
      },
    },
    navigateTo(href: string) {
      window.parent.postMessage(
        {
          sender: "Sandbox",
          type: "NavigateHostTo",
          payload: { href },
        },
        "*",
      );
    },
  };
}

async function waitForRenderPayload(): Promise<
  Extract<HostMessage, { type: "RenderApp" }>["payload"]
> {
  return new Promise((resolve) => {
    const handleMessage = ({ data: message }: MessageEvent) => {
      if (!isHostMessage(message)) {
        return;
      }

      if (message.type === "RenderApp") {
        window.removeEventListener("message", handleMessage);
        resolve(message.payload);
      }
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      { sender: "Sandbox", type: "SandboxReady", payload: null },
      "*",
    );
  });
}

function ensureResponseListener(): void {
  if (responseListenerRegistered) {
    return;
  }
  responseListenerRegistered = true;
  window.addEventListener("message", ({ data: message }: MessageEvent) => {
    if (
      isHostMessage(message) &&
      message.type === "RespondToBackendMethodInvocation"
    ) {
      const resolveInvocation = invocations.get(message.payload.invocationId);
      if (resolveInvocation) {
        invocations.delete(message.payload.invocationId);
        resolveInvocation(message.payload.result);
      }
    }
  });
}

function invokeBackendMethod(
  entity: string,
  method: string,
  args: any[],
): Promise<Result<any, any>> {
  const invocationId = crypto.randomUUID();
  return new Promise((resolve) => {
    invocations.set(invocationId, resolve);
    window.parent.postMessage(
      {
        sender: "Sandbox",
        type: "InvokeBackendMethod",
        payload: { invocationId, entity, method, args },
      },
      "*",
    );
  });
}

function isHostMessage(message: unknown): message is HostMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as any).sender === "Host" &&
    typeof (message as any).type === "string"
  );
}

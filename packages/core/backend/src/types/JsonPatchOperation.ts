type JsonPatchOperation =
  | {
      op: "add";
      path: string;
      value: unknown;
    }
  | {
      op: "remove";
      path: string;
    }
  | {
      op: "replace";
      path: string;
      value: unknown;
    }
  | {
      op: "move";
      path: string;
      from: string;
    }
  | {
      op: "copy";
      path: string;
      from: string;
    }
  | {
      op: "test";
      path: string;
      value: unknown;
    };

export default JsonPatchOperation;

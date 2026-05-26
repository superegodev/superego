export interface FieldDiff<Value> {
  changed: boolean;
  local: Value;
  remote: Value;
}

export interface EqualLine {
  kind: "equal";
  line: string;
}

export interface DeletedLine {
  kind: "delete";
  line: string;
}

export interface InsertedLine {
  kind: "insert";
  line: string;
}

export type LineChange = EqualLine | DeletedLine | InsertedLine;

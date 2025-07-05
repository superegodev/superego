export default function clone<Value>(value: Value): Value {
  return structuredClone(value);
}

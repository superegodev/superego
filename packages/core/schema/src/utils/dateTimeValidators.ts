export function isValidPlainDate(value: string): boolean {
  try {
    return (
      new Date(`${value}T00:00:00.000Z`).toISOString().split("T")[0] === value
    );
  } catch {
    return false;
  }
}

export function isValidPlainTime(value: string): boolean {
  return /^T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{1,3})?$/.test(value);
}

export function isValidOffset(value: string): boolean {
  return value === "Z" || /^[+-]\d{2}(?::?\d{2})?$/.test(value);
}

export function isValidInstant(value: string): boolean {
  const indexOfT = value.indexOf("T");
  const indexOfOffsetChar = findLastIndex(value, /[Z+-]/);
  const plainDate = value.slice(0, indexOfT);
  const plainTime = value.slice(indexOfT, indexOfOffsetChar);
  const offset = value.slice(indexOfOffsetChar);
  return (
    isValidPlainDate(plainDate) &&
    isValidPlainTime(plainTime) &&
    plainTime.length === "T00:00:00.000".length &&
    isValidOffset(offset) &&
    Number.isFinite(Date.parse(value))
  );
}

function findLastIndex(value: string, regex: RegExp): number {
  for (let i = value.length; i >= 0; i--) {
    if (regex.test(value[i]!)) {
      return i;
    }
  }
  return -1;
}

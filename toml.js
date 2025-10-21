const IDENTIFIER_REGEX = /^[A-Za-z0-9_-]+$/;

export function jsonToToml(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Top-level JSON must be an object to convert to TOML.");
  }

  const lines = [];
  convertObject(input, [], lines, { isArrayItem: false });
  return lines.join("\n");
}

function convertObject(obj, path, lines, { isArrayItem }) {
  if (path.length) {
    const header = `${isArrayItem ? "[[" : "["}${path.join(".")}${isArrayItem ? "]]" : "]"}`;
    if (lines.length && lines[lines.length - 1] !== "") {
      lines.push("");
    }
    lines.push(header);
  }

  const inlineEntries = [];
  const nestedObjects = [];
  const arrayTables = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }

    if (isPlainObject(value)) {
      nestedObjects.push({ key, value });
    } else if (Array.isArray(value) && value.some(isPlainObject)) {
      arrayTables.push({ key, value });
    } else {
      inlineEntries.push({ key, value });
    }
  }

  for (const { key, value } of inlineEntries) {
    const renderedValue = stringifyTomlValue(value);
    const renderedKey = stringifyKey(key);
    lines.push(`${renderedKey} = ${renderedValue}`);
  }

  for (const { key, value } of nestedObjects) {
    convertObject(value, path.concat(key), lines, { isArrayItem: false });
  }

  for (const { key, value } of arrayTables) {
    const tablePath = path.concat(key);
    for (const entry of value) {
      if (!isPlainObject(entry)) {
        throw new Error(`Mixed array types are not supported for key "${key}".`);
      }
      convertObject(entry, tablePath, lines, { isArrayItem: true });
    }
  }
}

function stringifyTomlValue(value) {
  if (value === null) {
    throw new Error("TOML does not support null values.");
  }

  const type = typeof value;

  switch (type) {
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) {
        throw new Error("TOML only supports finite numeric values.");
      }
      return String(value);
    case "string":
      return stringifyString(value);
    case "object":
      if (Array.isArray(value)) {
        return stringifyArray(value);
      }
      throw new Error("Nested objects must be represented using tables in TOML.");
    default:
      throw new Error(`Unsupported value type: ${type}`);
  }
}

function stringifyArray(values) {
  const renderedValues = values.map((item) => {
    if (item === null) {
      throw new Error("TOML arrays cannot contain null values.");
    }
    if (isPlainObject(item)) {
      throw new Error("Array of objects should be converted to tables before stringifying.");
    }
    return stringifyTomlValue(item);
  });

  if (!isHomogeneousArray(renderedValues, values)) {
    throw new Error("TOML arrays must contain elements of the same type.");
  }

  return `[${renderedValues.join(", ")}]`;
}

function stringifyKey(key) {
  if (IDENTIFIER_REGEX.test(key)) {
    return key;
  }
  return stringifyString(key);
}

function stringifyString(str) {
  const escaped = str
    .replace(/\\/g, "\\\\")
    .replace(/\u0008/g, "\\b")
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/\f/g, "\\f")
    .replace(/\r/g, "\\r")
    .replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isHomogeneousArray(renderedValues, originalValues) {
  if (originalValues.length <= 1) return true;

  const firstType = inferArrayType(originalValues[0]);
  return originalValues.every((item) => inferArrayType(item) === firstType);
}

function inferArrayType(value) {
  if (Array.isArray(value)) return "array";
  return typeof value;
}

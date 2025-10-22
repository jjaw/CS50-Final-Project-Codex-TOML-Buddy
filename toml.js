const SIMPLE_KEY = /^[A-Za-z0-9_-]+$/;

export function jsonToToml(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Please provide a JSON object at the top level.");
  }

  const lines = [];
  writeTable(data, [], lines, false);
  return lines.join("\n");
}

function writeTable(obj, path, lines, isArrayItem) {
  if (path.length) {
    const header = `${isArrayItem ? "[[" : "["}${path.join(".")}${isArrayItem ? "]]" : "]"}`;
    if (lines.length && lines[lines.length - 1] !== "") {
      lines.push("");
    }
    lines.push(header);
  }

  // Bucket keys so we write inline values first, then child tables.
  const inline = [];
  const nested = [];
  const arrayTables = [];

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (value === undefined) {
      continue;
    }

    if (isPlainObject(value)) {
      nested.push([key, value]);
      continue;
    }

    if (Array.isArray(value) && value.every(isPlainObject)) {
      arrayTables.push([key, value]);
      continue;
    }

    inline.push([key, value]);
  }

  for (const [key, value] of inline) {
    lines.push(`${formatKey(key)} = ${formatValue(value)}`);
  }

  for (const [key, value] of nested) {
    writeTable(value, [...path, key], lines, false);
  }

  for (const [key, value] of arrayTables) {
    for (const entry of value) {
      writeTable(entry, [...path, key], lines, true);
    }
  }
}

function formatKey(key) {
  if (SIMPLE_KEY.test(key)) {
    return key;
  }
  return `"${key.replace(/"/g, '\\"')}"`;
}

function formatValue(value) {
  if (value === null) {
    throw new Error("TOML does not support null values.");
  }

  if (Array.isArray(value)) {
    if (!value.every((item) => !isPlainObject(item))) {
      throw new Error("Array values must all be primitives for TOML output.");
    }
    const rendered = value.map((item) => formatValue(item));
    return `[${rendered.join(", ")}]`;
  }

  switch (typeof value) {
    case "string":
      return `"${escapeString(value)}"`;
    case "number":
      if (!Number.isFinite(value)) {
        throw new Error("Only standard numbers are supported in TOML output.");
      }
      return String(value);
    case "boolean":
      return value ? "true" : "false";
    default:
      throw new Error(`Unsupported value type: ${typeof value}`);
  }
}

function escapeString(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/"/g, '\\"');
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const SIMPLE_KEY = /^[A-Za-z0-9_-]+$/;

// Converts a JS object to TOML format string
export function jsonToToml(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Please provide a JSON object at the top level.");
    }

    const lines = [];
    writeTable(data, [], lines, false);
    return lines.join("\n");
}

// Recursively writes a table and its contents to the output lines
function writeTable(obj, path, lines, isArrayItem) {
    if (path.length) {
        const header = `${isArrayItem ? "[[" : "["}${path.join(".")}${isArrayItem ? "]]" : "]"}`;
        if (lines.length && lines[lines.length - 1] !== "") {
            lines.push("");
        }
        lines.push(header);
    }

    // Organize keys into three categories based on their values: simple values, nested objects, and arrays of objects.
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

// Formats a key for TOML, adding quotes if it contains special characters
function formatKey(key) {
    if (SIMPLE_KEY.test(key)) {
        return key;
    }
    return `"${key.replace(/"/g, `\\"`)}"`;
}

// Formats a JS value into TOML syntax (strings, numbers, booleans, and arrays)
function formatValue(value) {
    if (value === null) {
        throw new Error("TOML does not support null values.");
    }

    if (Array.isArray(value)) {
        // Check to see if any values are objects
        if (value.some((item) => isPlainObject(item))) {
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

// Escapes special characters in strings for TOML output
// Credits to ChatGPT for the common escape patterns
function escapeString(str) {
    return str
        .replace(/\\/g, "\\\\")   // Escape backslashes
        .replace(/\t/g, "\\t")    // Escape tabs
        .replace(/\n/g, "\\n")    // Escape newlines
        .replace(/\r/g, "\\r")    // Escape carriage returns
        .replace(/"/g, `\\"`);    // Escape quotes
}

// Checks if a value is a plain object (not an array or null)
function isPlainObject(value) {
    return value != null && typeof value === "object" && !Array.isArray(value);
}

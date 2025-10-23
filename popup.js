import { jsonToToml } from "./toml.js";

const elements = {
  jsonInput: document.getElementById("jsonInput"),
  tomlOutput: document.getElementById("tomlOutput"),
  convertBtn: document.getElementById("convertBtn"),
  copyBtn: document.getElementById("copyBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  inputStatus: document.getElementById("inputStatus"),
  outputStatus: document.getElementById("outputStatus")
};

let hasValidToml = false;

function showInputStatus(message, intent = "neutral") {
  const { inputStatus, outputStatus } = elements;
  inputStatus.textContent = message;
  inputStatus.classList.remove(
    "status-message-hidden",
    "status-message-error",
    "status-message-success"
  );
  if (intent === "error") {
    inputStatus.classList.add("status-message-error");
  } else if (intent === "success") {
    inputStatus.classList.add("status-message-success");
  }

  outputStatus.textContent = "";
  outputStatus.classList.add("status-message-hidden");
  outputStatus.classList.remove("status-message-error", "status-message-success");
}

function showOutputStatus(message, intent = "neutral") {
  const { inputStatus, outputStatus } = elements;
  inputStatus.classList.add("status-message-hidden");
  outputStatus.textContent = message;
  outputStatus.classList.remove(
    "status-message-hidden",
    "status-message-error",
    "status-message-success"
  );
  if (intent === "error") {
    outputStatus.classList.add("status-message-error");
  } else if (intent === "success") {
    outputStatus.classList.add("status-message-success");
  }
}

function setTomlResult(tomlText) {
  const { tomlOutput, copyBtn, downloadBtn } = elements;
  tomlOutput.value = tomlText;
  hasValidToml = Boolean(tomlText.trim());
  copyBtn.disabled = !hasValidToml;
  downloadBtn.disabled = !hasValidToml;
}

elements.convertBtn.addEventListener("click", () => {
  const jsonSnippet = elements.jsonInput.value.trim();

  if (!jsonSnippet) {
    setTomlResult("");
    showOutputStatus("Provide JSON before converting.", "error");
    return;
  }

  try {
    const parsed = JSON.parse(jsonSnippet);
    const toml = jsonToToml(parsed);
    setTomlResult(toml);
    showOutputStatus("Conversion complete.", "success");
    elements.inputStatus.classList.remove("status-message-error");
  } catch (err) {
    setTomlResult("");
    if (err instanceof SyntaxError) {
      showInputStatus("JSON is invalid. Please review the syntax.", "error");
      return;
    }
    showInputStatus(err.message || "Conversion failed. Please adjust your JSON.", "error");
  }
});

elements.copyBtn.addEventListener("click", async () => {
  if (!hasValidToml) return;

  try {
    await navigator.clipboard.writeText(elements.tomlOutput.value);
    showOutputStatus("TOML copied to clipboard.", "success");
    elements.inputStatus.classList.remove("status-message-error", "status-message-success");
  } catch (err) {
    showInputStatus("Clipboard copy failed. Try again.", "error");
  }
});

elements.downloadBtn.addEventListener("click", () => {
  if (!hasValidToml) return;

  const blob = new Blob([elements.tomlOutput.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "output.toml";
  anchor.click();
  URL.revokeObjectURL(url);
  showOutputStatus("Saved as output.toml.", "success");
  elements.inputStatus.classList.remove("status-message-error", "status-message-success");
});

elements.jsonInput.addEventListener("input", () => {
  // Keep feedback snappy while typing and ensure stale TOML is cleared.
  setTomlResult("");
  const text = elements.jsonInput.value.trim();
  if (text.length === 0) {
    showInputStatus("Waiting for JSON input.");
  } else {
    showInputStatus("Click Convert to generate TOML.");
  }
});

showInputStatus("Waiting for JSON input.");

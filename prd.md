1. Name

JSON → TOML Converter (for OpenAI Codex MCP setup)

2. Overview

A lightweight Chrome Extension that converts JSON to TOML directly in a popup.
Designed primarily for developers setting up OpenAI Codex’s MCP configuration, which requires TOML files instead of JSON (unlike Claude Code’s JSON format).

The tool provides a quick, offline, and privacy-safe way to paste JSON and instantly export valid TOML, eliminating the need for external converters or CLI tools.

3. Problem Statement

OpenAI Codex’s new MCP configuration uses TOML for settings, but most existing resources and examples (including Claude Code integrations) use JSON.
Developers need a simple, offline way to convert configuration files quickly without running scripts or trusting third-party sites.

4. Goals

Convert valid JSON into valid TOML instantly within a Chrome extension popup.

Keep everything local—no network access or data collection.

Allow users to copy or download the TOML result as a .toml file.

Provide an AI-inspired 1980s terminal aesthetic for the UI.

5. Reference

Official Codex MCP documentation:
https://developers.openai.com/codex/mcp/

6. Functional Requirements
6.1 Popup UI

Two main text areas:

Input box: paste or type JSON.

Output box: shows converted TOML.

Buttons:

Convert → runs the JSON→TOML function.

Copy → copies TOML to clipboard.

Download .toml → saves result as output.toml.

6.2 Conversion Logic

Runs fully client-side using:

a lightweight embedded TOML stringifier (preferred) or

a UMD build of @iarna/toml (fallback for spec-compliance).

Handles:

Strings, numbers, booleans, arrays, nested objects.

Graceful error messaging for invalid JSON.

6.3 Permissions

None beyond "action" (default popup).

No host access, content scripts, or remote code.

Runs offline; meets Chrome Web Store privacy standards.

7. Technical Requirements
7.1 manifest.json

manifest_version: 3

"action": { "default_popup": "popup.html" }

"name", "description", "version", "icons"

No additional permissions required.

7.2 Framework

Built with React + Vite for lightweight bundling (optional; plain JS acceptable).

Deployed as a static MV3 extension.

7.3 File structure
/json-to-toml-extension
│
├─ manifest.json
├─ popup.html
├─ popup.js
├─ toml.js      # library or minimal converter
├─ styles.css
└─ icons/

8. Design & Styling
Theme: “Retro AI Terminal”

Dark background (#0A0A0A or #111)

Monospace fonts (IBM Plex Mono, JetBrains Mono, or VT323)

Neon accents (cyan, magenta, or green)

Subtle scanline or CRT effect background

Goal: evoke an 80s-inspired machine-intelligence console vibe without hurting readability.

9. Error Handling

Detect malformed JSON and show a user-friendly message:

“Invalid JSON. Please check for missing quotes or commas.”

Disable Copy/Download buttons until a valid TOML result exists.

No console errors or silent failures.

10. Future Enhancements (Optional)

Add TOML → JSON reverse conversion toggle.

Add content script: right-click → “Convert selected JSON to TOML”.

Add auto-detect if clipboard contains JSON upon popup open.

Add keyboard shortcuts for developers (Ctrl+Enter to convert).

11. Acceptance Criteria

✅ Converts JSON → TOML instantly.
✅ No permissions beyond default popup.
✅ Works offline, no API calls.
✅ Handles nested JSON safely.
✅ Passes Chrome Web Store review (privacy-compliant).
✅ Styled with a consistent “retro terminal” aesthetic.


[aptos-mcp]
command = "npx"
args = ["-y", "@aptos-labs/aptos-mcp"]
type = "stdio"

[aptos-mcp.env]
APTOS_BOT_KEY = "<your_bot_api_key>"
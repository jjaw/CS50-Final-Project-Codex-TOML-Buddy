# Codex TOML Buddy
#### Video Demo: <URL HERE> (will be filled in later)
#### Desription:
Chrome extension popup that converts Claude-style MCP JSON into Codex-ready TOML without leaving the browser.

I built Codex TOML Buddy as a quick Chrome extension to convert Claude-style JSON configs into the TOML format that OpenAI Codex expects. I wanted something that lived in the toolbar, stayed offline, and didn’t rely on random converters. Clicking the extension icon opens a small popup with two text areas: JSON goes on top, TOML shows up underneath, and a status line tells me what happened. Workflow is paste, convert, done... with optional copy or download. 

`manifest.json`  
Defines the extension for Chrome (Manifest V3). I set the action popup to `popup.html`, provide the name “Codex TOML Buddy,” and point to a small icon set so the extension looks consistent in the toolbar. No extra permissions are requested since everything runs locally inside the popup, which keeps Chrome’s permission prompt clean and the review process straightforward.

`popup.html`  
Contains the markup for the popup window. There’s a header with the title, an input panel for JSON, an output panel for TOML, and a footer toolbar with Convert, Copy, and Download buttons. I also added two status paragraphs—one inside the JSON panel for neutral/error messages and one inside the TOML panel for success feedback—plus a tiny footer note crediting the Good Rabbit Foundation because they inspired the idea and encouraged me to package this up.

`popup.js`  
Handles all popup interactions. When the user clicks Convert, the script reads the JSON textarea, tries `JSON.parse`, and if that succeeds, calls `jsonToToml`. Successful conversions enable the Copy/Download buttons, update the TOML textarea, and show a green message. Errors keep the TOML box empty and show a red warning under the JSON panel. Copy uses `navigator.clipboard.writeText`, download generates a `Blob` and triggers a download named `output.toml`, and the input listener clears old results as soon as the JSON box changes.

`styles.css`  
Tries to adhere to Google's Material Design 3 system. I use a few CSS variables for background, accent, and status colors, then rely on flexbox for layout. Textareas get a subtle focus outline, buttons are pill-shaped with hover/press states, and the status lines stay readable with muted gray by default, green for success, and Material’s dark-theme red for errors. The styling is intentionally straightforward so I can maintain it without advanced CSS features, and it matches the terminal vibe that most developer tools lean into.

`toml.js`  
Provides the JSON→TOML conversion used in the popup. The function checks that the top level is an object, then walks it recursively, writing inline key/value pairs first, followed by child tables, and finally array tables for arrays of objects. Strings are escaped, keys with spaces are quoted, nulls/non-finite numbers are rejected, and arrays that mix objects with primitives throw a warning so the user knows why conversion failed. This covers the MCP configurations I’ve seen without implementing the entire TOML spec, and the file is short enough that I can read through it quickly when debugging. This parser will mostly only cover our use case of converting MCP setup from JSON to TOML format. It will not cover most other use cases nor any edge case.

`Testing`  
Most of my testing happens through Node and manual runs in Chrome. I run `node --input-type=module` to call `jsonToToml` with sample JSON and check the output, and I verify error messages using malformed inputs. Inside the popup, I try empty JSON, missing commas, arrays of tables, and clipboard failures. The status messages make it easy to confirm whether the UI is reacting correctly, and I jot down any weird edge cases I hit so I can improve the converter later. Eventually I plan to script these scenarios with simple automated checks. It was a lot of manual trial and error testings.

`Design choices`  
I looked into using an existing TOML library like `@iarna/toml`, but the popular packages haven’t been updated in years and would add extra bundle weight. Keeping the extension offline and lightweight felt more important, so I wrote `toml.js` myself to cover the shapes we actually use. The CSS stylesheet was a similar choice, rather than adopt an automated Material theme, I kept the CSS hand-written so I fully understand every piece of it and can explain every design choice during a code review. If a better or newer TOML praser comes out, I will leverage its resource.

All of the pieces work together as a simple pipeline: `manifest.json` points Chrome at the popup, `popup.html` lays out the interface, `styles.css` keeps it readable, `popup.js` drives user interactions, and `toml.js` performs the conversion. The project stays small enough for me to maintain while still solving the annoying gap between Claude’s JSON examples and Codex’s TOML requirements. I use it whenever I need to copy configurations into Codex MCP, and it’s already saved me plenty of time.*** End Patch

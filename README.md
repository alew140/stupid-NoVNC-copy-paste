# VNCPaste

> Clipboard-to-keyboard bridge for NoVNC — paste text into remote desktop sessions with a single right-click.

[![CI](https://github.com/alew140/stupid-NoVNC-copy-paste/actions/workflows/ci.yml/badge.svg)](https://github.com/alew140/stupid-NoVNC-copy-paste/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/novnc-paste.svg)](https://www.npmjs.com/package/novnc-paste)

---

## What is this?

NoVNC doesn't expose a native paste shortcut in many configurations. **VNCPaste** solves this by intercepting a right-click on the NoVNC canvas and replaying your clipboard contents as a stream of synthetic keyboard events — no browser extension, no server changes, no dependencies.

Drop it in the browser console, paste with a right-click.

```
VNCPaste@2025#TestHash$Alew140.dev%  ← All of this pastes correctly
```

Supports:
- Uppercase & lowercase letters
- Shift-dependent special characters (`@`, `#`, `$`, `%`, `^`, `&`, `*`, …)
- Newlines (`\n`) → Enter key
- Windows line endings (`\r\n`) normalised automatically

---

## Quick Start

### Option A — Browser console (30 seconds)

1. Open your NoVNC session in the browser.
2. Press **F12** → open the **Console** tab.
3. Copy the contents of [`index.js`](index.js).
4. Paste into the console and press **Enter**.
5. **Right-click** the NoVNC canvas to paste clipboard text.

### Option B — Bookmarklet

Create a bookmark whose URL is:

```
javascript:(function(){fetch('https://cdn.jsdelivr.net/gh/alew140/stupid-NoVNC-copy-paste@main/index.js').then(r=>r.text()).then(eval)})();
```

Click the bookmark while a NoVNC tab is active to inject VNCPaste automatically.

---

## Configuration

VNCPaste is zero-config by default. All options are optional.

```javascript
const vncPaste = new VNCPaste({
    selector: '#noVNC_canvas',  // Primary CSS selector for the canvas
    fallbackSelector: 'canvas', // Fallback selector
    delay: 50,                  // Inter-character delay in ms (increase for slow connections)
    enableLogging: true,        // Log activity to the browser console
    rightClickEnabled: true,    // Right-click-to-paste (set false to use sendString() only)
});

vncPaste.init();
```

### Programmatic usage

```javascript
// Type text without right-clicking
vncPaste.sendString('echo "Hello, World!"\n');

// Also available as a global shorthand after init()
sendString('ls -la\n');
```

### Teardown

```javascript
vncPaste.destroy(); // Removes listeners and cleans up window.sendString
```

---

## Escaping backslashes in the console

When typing `sendString` directly in the browser console, remember that the console processes JavaScript string literals:

| You type | What gets sent |
|---|---|
| `sendString('\\n')` | literal `\n` |
| `sendString('\n')` | Enter key |

```javascript
// Execute a command
sendString('ls\n');

// Type a literal \n inside a shell string
sendString('echo -e "\\nLine 1\\nLine 2"');
```

---

## Development

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Setup

```bash
git clone https://github.com/alew140/stupid-NoVNC-copy-paste.git
cd stupid-NoVNC-copy-paste
npm install
```

### Available scripts

| Command | Description |
|---|---|
| `npm test` | Run the test suite (Jest + jsdom) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint source and tests (ESLint) |
| `npm run lint:fix` | Auto-fix lint issues |

### Running tests

```bash
npm test
```

```
Tests:       29 passed, 29 total
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## Roadmap

See the [GitHub Issues](https://github.com/alew140/stupid-NoVNC-copy-paste/issues) and [Milestones](https://github.com/alew140/stupid-NoVNC-copy-paste/milestones) for the 1.0 plan.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of changes.

---

## License

[MIT](LICENSE) © [alew140](https://alew140.dev)

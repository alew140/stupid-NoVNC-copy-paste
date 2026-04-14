# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `package.json` with npm metadata and `test` / `lint` scripts.
- ESLint configuration (`eslint.config.js`) with consistent style rules.
- Jest test suite (`tests/vncpaste.test.js`) — 29 tests, jsdom environment.
- `CONTRIBUTING.md` with setup, branching, and commit-message guidelines.
- `LICENSE` (MIT).
- `CHANGELOG.md` (this file).
- GitHub Actions CI workflow (`.github/workflows/ci.yml`): lint + test on every push and pull request.
- GitHub issue templates for bug reports and feature requests.
- GitHub pull request template.

### Changed
- Renamed `Index.js` → `index.js` (standard lowercase filename convention).
- Refactored `VNCPaste` class with full JSDoc, English log messages, and modular structure.
- Fixed `destroy()`: now uses a stable bound-function reference (`_boundHandleRightClick`) so `removeEventListener` correctly removes the registered handler.
- `sendShiftEvent` now sets `shiftKey` correctly to the actual modifier state and adds `key: 'Shift'` and `bubbles: true`.
- `sendString` always releases Shift at the end of the string to leave the canvas in a clean state.
- `sendString` loop uses `for...of` over the normalised string for cleaner iteration.
- Improved shift-toggle logic in `sendString`: checks `specialKeys` map for `shiftKey` flag instead of only upper-case letters.
- Added CJS `module.exports` for Node / bundler environments.
- Auto-init block is guarded by `typeof window !== 'undefined'` to avoid errors in test environments.
- Rewrote `README.md` with professional structure, badges, quick-start options, configuration table, and development guide.

---

## [1.5.0] — 2025-01-xx

### Added
- Newline (`\n`) now dispatches an `Enter` key event.
- Windows line-ending normalisation: `\r\n` is stripped of `\r` before processing.

---

## [1.3.0] — 2024-xx-xx

### Fixed
- Case inversion bug: uppercase letters were typed as lowercase and vice versa (thanks [@SiegfriedSchmidt](https://github.com/SiegfriedSchmidt)).

---

## [1.0.0] — 2024-xx-xx

### Added
- Initial release.
- Right-click-to-paste via clipboard API.
- Support for Shift-required special characters (`@`, `#`, `$`, …).
- Configurable canvas selector, delay, logging, and right-click toggle.

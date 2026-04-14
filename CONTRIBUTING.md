# Contributing to VNCPaste

Thank you for considering a contribution! This document explains how to get set up, the standards we follow, and how to submit changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) Code of Conduct. By participating, you are expected to uphold this standard. Please report unacceptable behaviour to the maintainers via GitHub Issues.

---

## Getting Started

### Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 18 |
| npm | 9 |
| Git | Any recent version |

### Fork & clone

```bash
# 1. Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/stupid-NoVNC-copy-paste.git
cd stupid-NoVNC-copy-paste

# 2. Install dependencies
npm install

# 3. Verify everything works
npm run lint && npm test
```

---

## Development Workflow

### Branch naming

| Type | Pattern | Example |
|---|---|---|
| Bug fix | `fix/<short-description>` | `fix/shift-key-not-released` |
| New feature | `feat/<short-description>` | `feat/ctrl-v-shortcut` |
| Documentation | `docs/<short-description>` | `docs/update-readme` |
| Chore / tooling | `chore/<short-description>` | `chore/upgrade-eslint` |

Always branch off `main`:

```bash
git checkout main
git pull origin main
git checkout -b fix/my-fix
```

### Making changes

1. Edit `index.js` for source changes.
2. Add or update tests in `tests/vncpaste.test.js`.
3. Run the full check before committing:

```bash
npm run lint && npm test
```

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`

Examples:

```
feat(sendString): add support for Tab key
fix(destroy): use stable bound reference to remove listener correctly
docs(README): add bookmarklet usage example
```

---

## Coding Standards

- **ESLint** enforces the style rules defined in `eslint.config.js`. Run `npm run lint:fix` to auto-fix what can be fixed automatically.
- **No new dependencies** in `dependencies` (the script runs in a browser with no bundler). Dev tools belong in `devDependencies`.
- **JSDoc** — add or update JSDoc annotations for any new public method or option.
- **Tests** — every bug fix must include a regression test; every new feature must include at least one happy-path and one error-path test.

---

## Submitting a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin fix/my-fix
   ```

2. Open a Pull Request against `main` on this repository.

3. Fill in the PR template (it will appear automatically).

4. CI will run lint and tests. The PR cannot be merged until all checks pass.

5. A maintainer will review your PR, leave feedback if needed, and merge it when it's ready.

---

## Reporting Bugs

Open an [issue](https://github.com/alew140/stupid-NoVNC-copy-paste/issues/new?template=bug_report.md) and include:

- **Steps to reproduce** (which NoVNC version, browser, OS)
- **Expected behaviour**
- **Actual behaviour**
- Console output (open DevTools → Console, copy any `[VNCPaste]` log lines)

---

## Requesting Features

Open an [issue](https://github.com/alew140/stupid-NoVNC-copy-paste/issues/new?template=feature_request.md) with:

- **Problem description** — what can't you do today?
- **Proposed solution** — how should VNCPaste behave?
- **Alternatives considered** (optional)

---

Made with ❤️ by [alew140](https://alew140.dev) and contributors.

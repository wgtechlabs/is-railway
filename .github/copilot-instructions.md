# is-railway Copilot Instructions

## Project Overview

`is-railway` is a lightweight TypeScript/Node.js utility that detects whether the current environment is running on [Railway](https://railway.app). It exposes simple detection helpers and environment-aware utilities for Railway-hosted applications.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Test Framework**: Vitest
- **Linter**: ESLint
- **Package Manager**: npm

## Commit Convention

All commits must follow the WG Technology Labs Clean Commit convention.

```text
<emoji> <type>: <description>
<emoji> <type> (<scope>): <description>
<emoji> <type>!: <description>
<emoji> <type>! (<scope>): <description>
```

| Emoji | Type | What it covers |
|:-----:|------|----------------|
| 📦 | `new` | Adding new features, files, or capabilities |
| 🔧 | `update` | Changing existing code, refactoring, improvements |
| 🗑️ | `remove` | Removing code, files, features, or dependencies |
| 🔒 | `security` | Security fixes, patches, vulnerability resolutions |
| ⚙️ | `setup` | Project configs, CI/CD, tooling, build systems |
| ☕ | `chore` | Maintenance tasks, dependency updates, housekeeping |
| 🧪 | `test` | Adding, updating, or fixing tests |
| 📖 | `docs` | Documentation changes and updates |
| 🚀 | `release` | Version releases and release preparation |

## Rules

- Use lowercase type names.
- Use present tense.
- Do not end the description with a period.
- Keep descriptions concise and under 72 characters when possible.
- Use a scope only when it improves clarity.

## Workflow Rules

- Keep tests passing before merging any change.
- All public API changes must be reflected in types and documentation.
- Prefer small, focused changes that keep the detection logic and type exports coherent.
- Update `README.md` when public API or environment variable behavior changes.

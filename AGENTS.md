# Repository Guidelines

## Project Structure & Module Organization
- `manifest.json`: Chrome MV3 manifest and permissions.
- `content.js`: Injected content script; reads/writes prompts and renders the overlay.
- `background.js`: Listens for the keyboard command and messages content scripts.
- `popup/`: Extension settings UI (`popup.html`, `popup.js`, `popup.css`).
- `icons/`: Extension icons for the Chrome UI.
- `README.md`: User-facing overview and quick start.

## Build, Test, and Development Commands
- Build: No build step required. The code runs as-is (MV3, plain JS).
- Run locally: In Chrome → `chrome://extensions` → enable Developer Mode → Load unpacked → select the repo root.
- Reload: After edits, click Reload on the extension and refresh the target tab.
- Packaging: Use Chrome’s “Pack extension…” or zip the folder for store upload.

## Coding Style & Naming Conventions
- Language: Vanilla JS, HTML, CSS (no framework).
- Indentation: 2 spaces; use semicolons; prefer single quotes for JS strings.
- Filenames: lower-case with hyphens or simple names (e.g., `content.js`, `background.js`).
- Lint/format: None enforced; if adding tooling, use Prettier + ESLint (recommended rules: `eslint:recommended`).

## Testing Guidelines
- Scope: Manual functional testing across supported sites (ChatGPT, Claude, Gemini).
- Steps: Load extension, open target site, press `Alt+A`, verify overlay, enhance/accept prompt, confirm prompt replacement.
- Regressions: Re-test selectors for prompt fields when UI of target sites changes.
- Optional: Add lightweight unit tests if introducing utilities; place under `tests/` with names like `selector-utils.test.js`.

## Commit & Pull Request Guidelines
- Style: Prefer Conventional Commits. Examples:
  - `feat(content): improve selector coverage for ChatGPT`
  - `fix(overlay): handle missing editable fields gracefully`
- PRs: Include a clear description, linked issue, steps to reproduce/verify, and screenshots/GIFs (overlay + popup).
- Scope: Keep changes focused; update `README.md` and comments when behavior changes.

## Security & Configuration Tips
- API Key: Users store keys via the popup (`chrome.storage.sync`). Never commit secrets.
- Permissions: Keep `manifest.json` permissions minimal; justify new `host_permissions` in PRs.
- Network: All API calls must use HTTPS; handle errors without leaking keys to logs.

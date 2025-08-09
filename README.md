# Gemini Prompt Enhancer

Gemini Prompt Enhancer is a Chrome extension that refines your prompts with **Gemini 2.5 Flash** before sending them to ChatGPT, Claude.ai, or Gemini. It detects which platform you're using and injects an overlay so you can polish your text with a single shortcut.

## Installation
1. Clone or download this repository.
2. In Chrome, open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select the `chrome-prompt-enhancer` folder. A wrench icon should appear in your toolbar.

## Configuration
1. Click the extension icon to open the settings popup.
2. Enter your API key for the provider you want to use and click **Save**.

## Usage
- Navigate to ChatGPT, Claude.ai, or Gemini and type your prompt.
- Press **Alt+A** (or your configured shortcut) to open the overlay.
- Choose **Enhance with Gemini** and then **Accept** to replace the prompt.

## Building for Release
The Chrome Web Store listing is maintained by the project owner. Please **do not upload this extension to the store under your own account**.

If you're preparing an official release:
1. Update the version in `manifest.json`.
2. Zip the extension directory excluding the `.git` folder:
   ```bash
   zip -r chrome-prompt-enhancer.zip . -x "*.git*" "node_modules/*"
   ```
3. Upload the ZIP in the Chrome Web Store dashboard along with screenshots and this repository's privacy policy.

## Contributing
Contributions are welcome! To submit a patch:
1. Fork this repository and create a branch.
2. Make your changes with clear, concise commits.
3. Ensure the extension works on all supported platforms.
4. Open a pull request explaining your changes.

By participating, you agree that your contributions will be licensed under the terms of the [MIT License](LICENSE).

## Privacy
This project does not collect personal data. API keys are stored locally via Chrome Sync and are sent only to the selected model provider over HTTPS. See [PRIVACY.md](PRIVACY.md) for full details.

## License
Released under the [MIT License](LICENSE).

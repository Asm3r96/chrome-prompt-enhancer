### 1. Load unpacked
1. Clone/download this folder.
2. In Chrome → `chrome://extensions`, enable *Developer mode* → *Load unpacked* → select the `chrome-prompt-enhancer` folder.
3. The wrench‑icon should appear in the toolbar.

### 2. Configure
* Click the extension icon to open the settings popup.
* Enter your Gemini API key and click **Save**.

### 3. Use it
* Open ChatGPT and type your prompt.
* Press **Alt+P** (or your chosen shortcut) to open the overlay on the page.
* Click **Enhance with Gemini** and then **Accept** to replace the prompt.

### 4. Troubleshooting
* If you get “API key required” check the popup.
* Reload the ChatGPT page if the prompt is not detected.

### 5. Security note
Your key is stored locally using `chrome.storage.sync` and is only sent directly to the chosen provider over HTTPS.
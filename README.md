### 1. Load unpacked
1. Clone/download this folder.
2. In Chrome → `chrome://extensions`, enable *Developer mode* → *Load unpacked* → select the `chrome-prompt-enhancer` folder.
3. The wrench‑icon should appear in the toolbar.

### 2. Configure
* Click the icon and enter your Gemini API key.

### 3. Use it
* Open ChatGPT and type your prompt.
* Click the extension icon to open the popup. The current prompt is loaded automatically.
* If needed, press **Refresh** to re-read the latest prompt from ChatGPT.
* Press **Enhance with Gemini** to get an improved version using Gemini 2.5 Flash.
* Click **Accept** to replace the text in ChatGPT.

### 4. Troubleshooting
* If you get “API key required” check the popup.
* Reload the ChatGPT page if the prompt is not detected.

### 5. Security note
Your key is stored locally using `chrome.storage.sync` and is only sent directly to the chosen provider over HTTPS.
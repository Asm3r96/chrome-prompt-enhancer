### 1. Load unpacked
1. Clone/download this folder.
2. In Chrome → `chrome://extensions`, enable *Developer mode* → *Load unpacked* → select the `chrome-prompt-enhancer` folder.
3. The wrench‑icon should appear in the toolbar.

### 2. Configure
* Click the extension icon to open the settings popup.
* Enter your Gemini API key and click **Save**.

### 3. Use it
* Open **ChatGPT**, **Claude.ai**, or **Gemini** and type your prompt.
* Press **Alt+A** (or your chosen shortcut) to open the overlay on the page.
* Click **Enhance with Gemini** and then **Accept** to replace the prompt.

### 4. Supported Platforms
✅ **ChatGPT** (chat.openai.com, chatgpt.com)  
✅ **Claude.ai** (claude.ai)  
✅ **Gemini** (gemini.google.com)  

The extension automatically detects which platform you're using and adapts accordingly.

### 5. Troubleshooting
* If you get "API key required" check the popup settings.
* If the prompt is not detected, try clicking **Refresh** in the overlay.
* Reload the page if the extension doesn't work properly.
* On Claude.ai, make sure you're typing in the main input area.
* On Gemini, ensure you're typing in the main prompt box.

### 6. Security note
Your API key is stored locally using `chrome.storage.sync` and is only sent directly to Google's Gemini API over HTTPS. No data is shared with third parties.
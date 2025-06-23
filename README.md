### 1. Load unpacked
1. Clone/download this folder.
2. In Chrome → `chrome://extensions`, enable *Developer mode* → *Load unpacked* → select the `chrome-prompt-enhancer` folder.
3. The wrench‑icon should appear in the toolbar.

### 2. Configure
* Click the icon → enter your API key and pick the model.
* Toggle the *Extension enabled* checkbox to temporarily disable injection without uninstalling.

### 3. Use it
* Open ChatGPT, Claude or Gemini.
* Type a prompt → click **✨ Enhance** → the textarea is instantly replaced with an improved version. Edit further or hit *Send*.

### 4. Troubleshooting
* If you get “API key not set” check the popup.
* Open *chrome://extensions* → *Service Worker* → *Inspect* to view background logs.
* If the ✨ Enhance button does not appear, reload the page and ensure the
  extension is enabled in the popup.

### 5. Security note
Your key is stored locally using `chrome.storage.sync` and is only sent directly to the chosen provider over HTTPS.
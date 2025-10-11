# PromptUp

Enhance your prompts using multiple AI providers (Gemini, OpenAI, Claude) directly on ChatGPT, Claude.ai, and Gemini platforms.

## 🚀 Installation

### From Chrome Web Store (Recommended)

[**Chrome Web Store**](https://chromewebstore.google.com/detail/peimojlpjafoadfidbmfihjfmafhhfna?utm_source=item-share-cb)

Click the link above to install PromptUp directly from the Chrome Web Store.

### Quick Setup

1. **Install** the extension from Chrome Web Store
2. **Configure** your API keys by clicking the extension icon
3. **Use** by pressing **Alt+A** on any supported platform

## ✨ How to Use

1. **Open any supported platform**
   - ChatGPT (chat.openai.com, chatgpt.com)
   - Claude.ai (claude.ai)
   - Gemini (gemini.google.com)

2. **Type your prompt** in the input field

3. **Press Alt+A** to open PromptUp overlay

4. **Click "Enhance Prompt"** and then **"Accept"** to replace your prompt

## 🔧 Configuration

1. Click the PromptUp extension icon in your toolbar
2. Select your preferred AI provider (Gemini, OpenAI, or Claude)
3. Enter your API key for the selected provider
4. Customize enhancement settings (tone, length, custom instructions)
5. Click **Save**

## 🎯 Features

- **Multi-AI Support**: Works with Gemini, OpenAI, and Claude APIs
- **Cross-Platform**: Integrates with ChatGPT, Claude.ai, and Gemini
- **Customizable**: Adjust tone, length, and add custom enhancement instructions
- **Keyboard Shortcut**: Quick access with Alt+A
- **History**: Track your enhanced prompts
- **Secure**: API keys stored locally, sent only to respective providers

## 🛠 Troubleshooting

- **"API key required"** - Check your API key in extension settings
- **Prompt not detected** - Click "Refresh" in the overlay
- **Extension not working** - Reload the page
- **Platform-specific issues**:
  - **Claude.ai**: Make sure you're typing in the main input area
  - **Gemini**: Ensure you're typing in the main prompt box

## 🔒 Privacy & Security

Your API keys are stored locally using Chrome's sync storage and are only sent directly to the respective AI providers over HTTPS. No data is shared with third parties or stored on external servers.

---

## 👩‍💻 For Developers

### Local Development

If you want to run PromptUp from source code:

#### Prerequisites

- Chrome browser
- API keys from your preferred AI provider(s)

#### Installation

1. **Clone or download** this repository
2. **Open Chrome** → go to `chrome://extensions`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** → select the `chrome-prompt-enhancer` folder
5. **Configure** your API keys through the extension popup

#### Development

- **Reload extension**: Click reload button in `chrome://extensions` after code changes
- **Debug content script**: Use browser DevTools on target pages
- **Debug background script**: Click "Inspect views: service worker"
- **Debug popup**: Right-click extension icon → Inspect popup

#### Architecture

- **Manifest V3** service worker extension
- **Content scripts** for ChatGPT, Claude.ai, Gemini integration
- **Background script** for AI API calls
- **Popup interface** for settings and history

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all supported platforms
5. Submit a pull request

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Having issues? Please report them on our [GitHub Issues page](https://github.com/asm3r96/chrome-prompt-enhancer/issues).

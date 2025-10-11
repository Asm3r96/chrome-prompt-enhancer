# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Gemini Prompt Enhancer" that integrates with ChatGPT, Claude.ai, and Gemini to enhance user prompts using various AI APIs. The extension provides:

- Multi-platform AI prompt enhancement (supports Gemini, OpenAI, and Claude APIs)
- Keyboard shortcut activation (Alt+A by default)
- Settings popup for API configuration and enhancement customization
- History tracking of enhanced prompts
- Platform-specific prompt detection and insertion

## Architecture

### Core Components

- **manifest.json**: Extension configuration with permissions for AI API endpoints and content script injection
- **background.js**: Service worker handling:
  - Keyboard command listeners
  - API calls to Gemini/OpenAI/Claude
  - Local storage for enhancement history
- **content.js**: Injected into target platforms (ChatGPT, Claude.ai, Gemini) for:
  - Platform detection and prompt extraction
  - UI overlay creation and management
  - Prompt replacement after enhancement
- **popup/**: Extension settings interface with tabbed UI for:
  - API key configuration
  - Enhancement settings (tone, length, custom prompts)
  - History browsing

### Platform Integration

The extension detects and adapts to three AI platforms:
- **ChatGPT**: Uses textarea selectors and direct value manipulation
- **Claude.ai**: Integrates with ProseMirror editor using DOM events
- **Gemini**: Uses textarea-based input detection

### API Integration

Supports three AI providers with configurable models:
- **Gemini**: Uses Google's Generative Language API with models like gemini-2.5-flash
- **OpenAI**: Uses Chat Completions API with models like gpt-4o-mini
- **Claude**: Uses Anthropic's Messages API with models like claude-3-haiku

## Development Commands

This is a Chrome extension with no build process - development is done directly with the source files:

- **Load extension**: Chrome → `chrome://extensions` → Enable Developer mode → Load unpacked
- **Reload extension**: Click reload button in Chrome extensions page after code changes
- **Debug content script**: Use browser DevTools on target pages (ChatGPT, Claude.ai, Gemini)
- **Debug background script**: Go to `chrome://extensions` → Click "Inspect views: service worker"
- **Debug popup**: Right-click extension icon → Inspect popup

## Key Implementation Details

### Prompt Enhancement Flow
1. User activates with Alt+A or opens overlay manually
2. Content script extracts current prompt based on platform
3. Background script calls selected AI API with enhancement settings
4. Enhanced prompt is returned and can be accepted/rejected by user
5. Successful enhancements are saved to local history

### Storage Structure
- `chrome.storage.sync`: API keys and user preferences
- `chrome.storage.local`: Enhancement history (last 100 entries)

### Platform-Specific Selectors
- **ChatGPT**: `#prompt-textarea`, `div[role="textbox"]`
- **Claude.ai**: `.ProseMirror` with paragraph extraction
- **Gemini**: `div[contenteditable="true"]` within Rich Text Editor

The extension uses Chrome Extension Manifest V3 with service worker architecture.
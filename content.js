/* global chrome */

// Detect which platform we're on
function detectPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('claude.ai')) return 'claude';
  if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) return 'chatgpt';
  if (hostname.includes('gemini.google.com')) return 'gemini';
  return 'unknown';
}

function getCurrentPrompt() {
  const platform = detectPlatform();
  
  if (platform === 'chatgpt') {
    const selectors = [
      '#prompt-textarea',
      'div[role="textbox"]',
      'textarea[data-testid="prompt-textarea"]',
      'textarea[placeholder*="message"]'
    ];
    
    for (const selector of selectors) {
      const field = document.querySelector(selector);
      if (field) {
        if (field.value !== undefined) {
          return field.value;
        } else if (field.innerText !== undefined) {
          return field.innerText;
        } else if (field.textContent !== undefined) {
          return field.textContent;
        }
      }
    }
  } else if (platform === 'claude') {
    // Claude uses ProseMirror editor
    const proseMirror = document.querySelector('.ProseMirror');
    if (proseMirror) {
      // Get text from the paragraph inside ProseMirror
      const paragraph = proseMirror.querySelector('p');
      if (paragraph) {
        return paragraph.textContent || paragraph.innerText || '';
      }
      // Fallback to ProseMirror itself
      return proseMirror.textContent || proseMirror.innerText || '';
    }
    
    // Fallback selectors for Claude
    const fallbackSelectors = [
      'div[contenteditable="true"]',
      'div[aria-label*="prompt"]',
      'div[aria-label*="Claude"]'
    ];
    
    for (const selector of fallbackSelectors) {
      const field = document.querySelector(selector);
      if (field) {
        return field.textContent || field.innerText || '';
      }
    }
  } else if (platform === 'gemini') {
    // Gemini uses Quill editor
    const quillEditor = document.querySelector('.ql-editor');
    if (quillEditor) {
      // Get text from the paragraph inside Quill editor
      const paragraph = quillEditor.querySelector('p');
      if (paragraph) {
        return paragraph.textContent || paragraph.innerText || '';
      }
      // Fallback to Quill editor itself
      return quillEditor.textContent || quillEditor.innerText || '';
    }
    
    // Fallback selectors for Gemini
    const fallbackSelectors = [
      'div[aria-label*="Enter a prompt"]',
      'div[data-placeholder*="Gemini"]',
      'div[contenteditable="true"]'
    ];
    
    for (const selector of fallbackSelectors) {
      const field = document.querySelector(selector);
      if (field) {
        return field.textContent || field.innerText || '';
      }
    }
  }
  
  return '';
}

function setCurrentPrompt(text) {
  const platform = detectPlatform();
  
  if (platform === 'chatgpt') {
    const selectors = [
      '#prompt-textarea',
      'div[role="textbox"]',
      'textarea[data-testid="prompt-textarea"]',
      'textarea[placeholder*="message"]'
    ];
    
    for (const selector of selectors) {
      const field = document.querySelector(selector);
      if (field) {
        try {
          if (field.value !== undefined) {
            field.value = text;
          } else {
            field.innerText = text;
            field.textContent = text;
          }
          
          // Trigger events for ChatGPT
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.focus();
          
          return true;
        } catch (error) {
          console.log('Error setting prompt with selector:', selector, error);
          continue;
        }
      }
    }
  } else if (platform === 'claude') {
    // Claude uses ProseMirror editor
    const proseMirror = document.querySelector('.ProseMirror');
    if (proseMirror) {
      try {
        // Set the content as a paragraph (matching Claude's structure)
        proseMirror.innerHTML = `<p>${text}</p>`;
        
        // Trigger events to notify Claude of the change
        proseMirror.dispatchEvent(new Event('input', { bubbles: true }));
        proseMirror.dispatchEvent(new Event('change', { bubbles: true }));
        proseMirror.dispatchEvent(new Event('keyup', { bubbles: true }));
        proseMirror.dispatchEvent(new Event('paste', { bubbles: true }));
        
        // Focus the editor
        proseMirror.focus();
        
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(proseMirror);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        return true;
      } catch (error) {
        console.log('Error setting Claude prompt:', error);
      }
    }
    
    // Fallback for other contenteditable elements
    const fallbackSelectors = [
      'div[contenteditable="true"]',
      'div[aria-label*="prompt"]',
      'div[aria-label*="Claude"]'
    ];
    
    for (const selector of fallbackSelectors) {
      const field = document.querySelector(selector);
      if (field) {
        try {
          field.innerHTML = `<p>${text}</p>`;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.focus();
          return true;
        } catch (error) {
          console.log('Error with fallback selector:', selector, error);
          continue;
        }
      }
    }
  } else if (platform === 'gemini') {
    // Gemini uses Quill editor
    const quillEditor = document.querySelector('.ql-editor');
    if (quillEditor) {
      try {
        // Set the content as a paragraph (matching Gemini's structure)
        quillEditor.innerHTML = `<p>${text}</p>`;
        
        // Trigger events to notify Gemini of the change
        quillEditor.dispatchEvent(new Event('input', { bubbles: true }));
        quillEditor.dispatchEvent(new Event('change', { bubbles: true }));
        quillEditor.dispatchEvent(new Event('keyup', { bubbles: true }));
        quillEditor.dispatchEvent(new Event('paste', { bubbles: true }));
        
        // Focus the editor
        quillEditor.focus();
        
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(quillEditor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        return true;
      } catch (error) {
        console.log('Error setting Gemini prompt:', error);
      }
    }
    
    // Fallback for other contenteditable elements
    const fallbackSelectors = [
      'div[aria-label*="Enter a prompt"]',
      'div[data-placeholder*="Gemini"]',
      'div[contenteditable="true"]'
    ];
    
    for (const selector of fallbackSelectors) {
      const field = document.querySelector(selector);
      if (field) {
        try {
          field.innerHTML = `<p>${text}</p>`;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.focus();
          return true;
        } catch (error) {
          console.log('Error with Gemini fallback selector:', selector, error);
          continue;
        }
      }
    }
  }
  
  return false;
}

// Respond to popup requests for getting or setting the prompt
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PROMPT') {
    const value = getCurrentPrompt();
    sendResponse({ prompt: value.trim() });
  } else if (msg.type === 'SET_PROMPT') {
    const ok = setCurrentPrompt(msg.prompt);
    if (ok) {
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false, error: 'Input field not found' });
    }
  } else if (msg.type === 'OPEN_OVERLAY') {
    openOverlay();
  }
  return true;
});

function injectOverlayStyles() {
  if (document.getElementById('prompt-enhancer-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'prompt-enhancer-styles';
  style.textContent = `
    /* Prompt Enhancer Overlay Styles */
    #prompt-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: linear-gradient(135deg, #1a1d29 0%, #2a2d3a 100%);
      border: 1px solid #3b82f6;
      border-radius: 16px;
      padding: 0;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: #e2e8f0;
      width: 480px;
      max-width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      animation: overlayAppear 0.3s ease-out;
    }

    @keyframes overlayAppear {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    #prompt-overlay-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      animation: backdropAppear 0.3s ease-out;
    }

    @keyframes backdropAppear {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .pe-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 16px 20px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid rgba(59, 130, 246, 0.2);
      position: relative;
    }

    .pe-close-btn {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }

    .pe-close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .pe-container {
      padding: 20px;
    }

    .pe-section {
      margin-bottom: 20px;
    }

    .pe-section:last-child {
      margin-bottom: 0;
    }

    .pe-label {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #334155;
      display: block;
    }

    .pe-textarea {
      width: 100%;
      background: #334155;
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 12px;
      color: #e2e8f0;
      font-size: 14px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      line-height: 1.4;
      transition: all 0.2s ease;
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;
    }

    .pe-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: #3f4a5c;
    }

    .pe-textarea::placeholder {
      color: #64748b;
    }

    .pe-textarea.enhanced {
      background: #1e293b;
      border-color: #22c55e;
      min-height: 100px;
    }

    .pe-button-group {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .pe-button {
      flex: 1;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      position: relative;
      overflow: hidden;
    }

    .pe-button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .pe-button:active {
      transform: translateY(0);
    }

    .pe-button:disabled {
      background: #475569;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .pe-button.refresh {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    }

    .pe-button.refresh:hover {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
    }

    .pe-button.enhance {
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      font-weight: 700;
    }

    .pe-button.enhance:hover {
      background: linear-gradient(135deg, #5b21b6 0%, #4c1d95 100%);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    }

    .pe-button.enhance::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .pe-button.enhance:hover::before {
      left: 100%;
    }

    .pe-button.accept {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      animation: glow 2s ease-in-out infinite alternate;
    }

    .pe-button.accept:hover {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }

    @keyframes glow {
      from { box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
      to { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
    }

    .pe-status {
      background: rgba(59, 130, 246, 0.1);
      color: #93c5fd;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 12px;
      text-align: center;
      border: 1px solid rgba(59, 130, 246, 0.2);
      min-height: 16px;
      transition: all 0.3s ease;
      display: none;
    }

    .pe-status.show {
      display: block;
    }

    .pe-status.success {
      background: rgba(34, 197, 94, 0.1);
      color: #86efac;
      border-color: rgba(34, 197, 94, 0.2);
    }

    .pe-status.error {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .pe-enhanced-section {
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .pe-enhanced-section.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .pe-button.loading {
      pointer-events: none;
      position: relative;
    }

    .pe-button.loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      transform: translate(-50%, -50%);
    }

    @keyframes spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* Scrollbar styling */
    .pe-textarea::-webkit-scrollbar {
      width: 6px;
    }

    .pe-textarea::-webkit-scrollbar-track {
      background: #1e293b;
      border-radius: 3px;
    }

    .pe-textarea::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 3px;
    }

    .pe-textarea::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    /* Platform indicator */
    .pe-platform-indicator {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      opacity: 0.8;
    }
  `;
  
  document.head.appendChild(style);
}

async function openOverlay() {
  if (document.getElementById('prompt-overlay')) return;

  // Inject styles first
  injectOverlayStyles();

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'prompt-overlay-backdrop';
  document.body.appendChild(backdrop);

  // Detect platform for display
  const platform = detectPlatform();
  const platformEmoji = platform === 'claude' ? '🤖' : platform === 'chatgpt' ? '🤖' : platform === 'gemini' ? '💎' : '✨';
  const platformName = platform === 'claude' ? 'Claude' : platform === 'chatgpt' ? 'ChatGPT' : platform === 'gemini' ? 'Gemini' : 'AI';

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'prompt-overlay';
  overlay.innerHTML = `
    <div class="pe-header">
      <div class="pe-platform-indicator">${platformEmoji}</div>
      ✨ Gemini Prompt Enhancer
      <button class="pe-close-btn" id="pe-close">×</button>
    </div>
    <div class="pe-container">
      <div class="pe-section">
        <label class="pe-label">📝 Current Prompt (${platformName})</label>
        <textarea id="pe-prompt" class="pe-textarea" rows="4" placeholder="Your prompt will appear here..."></textarea>
        <div class="pe-button-group">
          <button id="pe-refresh" class="pe-button refresh">🔄 Refresh</button>
          <button id="pe-enhance" class="pe-button enhance">🚀 Enhance with Gemini</button>
        </div>
      </div>
      
      <div class="pe-section pe-enhanced-section" id="pe-enhanced-section">
        <label class="pe-label">✨ Enhanced Prompt</label>
        <textarea id="pe-improved" class="pe-textarea enhanced" rows="4" placeholder="Enhanced prompt will appear here..."></textarea>
        <div class="pe-button-group">
          <button id="pe-accept" class="pe-button accept">✅ Accept & Replace</button>
        </div>
      </div>
      
      <div id="pe-status" class="pe-status"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const promptArea = overlay.querySelector('#pe-prompt');
  const refreshBtn = overlay.querySelector('#pe-refresh');
  const enhanceBtn = overlay.querySelector('#pe-enhance');
  const improvedArea = overlay.querySelector('#pe-improved');
  const acceptBtn = overlay.querySelector('#pe-accept');
  const closeBtn = overlay.querySelector('#pe-close');
  const status = overlay.querySelector('#pe-status');
  const enhancedSection = overlay.querySelector('#pe-enhanced-section');

  // Helper function to show status
  function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `pe-status show ${type}`;
    setTimeout(() => {
      status.className = 'pe-status';
    }, 3000);
  }

  function fetchPrompt() {
    const text = getCurrentPrompt();
    promptArea.value = text.trim();
    if (text.trim()) {
      showStatus(`✅ Prompt loaded from ${platformName}`, 'success');
    } else {
      showStatus(`❌ No prompt found. Make sure you're typing in ${platformName}`, 'error');
    }
  }

  // Load initial prompt
  fetchPrompt();

  // Event listeners
  refreshBtn.addEventListener('click', () => {
    refreshBtn.textContent = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    
    fetchPrompt();
    
    setTimeout(() => {
      refreshBtn.textContent = '🔄 Refresh';
      refreshBtn.disabled = false;
    }, 1000);
  });

  enhanceBtn.addEventListener('click', async () => {
    const prompt = promptArea.value.trim();
    
    if (!prompt) {
      showStatus('❌ Please enter a prompt to enhance', 'error');
      promptArea.focus();
      return;
    }

    try {
      // Show loading state
      enhanceBtn.disabled = true;
      enhanceBtn.classList.add('loading');
      enhanceBtn.textContent = '🤖 Enhancing...';
      
      // Get enhancement settings from storage
      const { enhancementSettings } = await chrome.storage.sync.get(['enhancementSettings']);

      // Request enhancement from background script
      const response = await chrome.runtime.sendMessage({ type: 'ENHANCE_PROMPT', prompt: prompt, enhancementSettings: enhancementSettings });

      if (response.success) {
        improvedArea.value = response.enhancedPrompt;
        enhancedSection.classList.add('show');
        showStatus('✨ Prompt enhanced successfully!', 'success');

        // Save the enhancement to history
        const { selectedApiProvider, selectedApiModel, enhancementSettings } = await chrome.storage.sync.get(['selectedApiProvider', 'selectedApiModel', 'enhancementSettings']);
        chrome.runtime.sendMessage({
          type: 'SAVE_ENHANCEMENT',
          data: {
            originalPrompt: prompt,
            enhancedPrompt: response.enhancedPrompt,
            apiProvider: selectedApiProvider,
            apiModel: selectedApiModel,
            enhancementSettings: enhancementSettings,
            timestamp: Date.now()
          }
        });

      } else {
        throw new Error(response.error || 'Unknown enhancement error');
      }
      
    } catch (err) {
      showStatus(`❌ ${err.message}`, 'error');
      console.error('Enhancement error:', err);
    } finally {
      enhanceBtn.disabled = false;
      enhanceBtn.classList.remove('loading');
      enhanceBtn.textContent = '🚀 Enhance Prompt';
    }
  });

  acceptBtn.addEventListener('click', () => {
    const enhancedPrompt = improvedArea.value.trim();
    
    if (!enhancedPrompt) {
      showStatus('❌ No enhanced prompt to accept', 'error');
      return;
    }
    
    acceptBtn.textContent = '⏳ Replacing...';
    acceptBtn.disabled = true;
    
    const ok = setCurrentPrompt(enhancedPrompt);
    if (ok) {
      showStatus(`✅ Prompt replaced in ${platformName}!`, 'success');
      setTimeout(() => {
        closeOverlay();
      }, 1000);
    } else {
      showStatus(`❌ Could not find input field in ${platformName}`, 'error');
      acceptBtn.textContent = '✅ Accept & Replace';
      acceptBtn.disabled = false;
    }
  });

  function closeOverlay() {
    overlay.style.animation = 'overlayAppear 0.3s ease-out reverse';
    backdrop.style.animation = 'backdropAppear 0.3s ease-out reverse';
    setTimeout(() => {
      overlay.remove();
      backdrop.remove();
    }, 300);
  }

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  // Close on Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeOverlay();
      document.removeEventListener('keydown', escapeHandler);
    }
  });

  // Auto-focus on prompt area if empty
  if (!promptArea.value.trim()) {
    promptArea.focus();
  }
}
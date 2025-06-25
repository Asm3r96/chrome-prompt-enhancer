/* global chrome */

function getCurrentPrompt() {
  const field = document.querySelector(
    '#prompt-textarea, div[role="textbox"], textarea[data-testid="prompt-textarea"]'
  );
  return field ? (field.value !== undefined ? field.value : field.innerText) : '';
}

function setCurrentPrompt(text) {
  const field = document.querySelector(
    '#prompt-textarea, div[role="textbox"], textarea[data-testid="prompt-textarea"]'
  );
  if (!field) return false;
  if (field.value !== undefined) {
    field.value = text;
  } else {
    field.innerText = text;
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// Respond to popup requests for getting or setting the ChatGPT prompt
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

async function openOverlay() {
  if (document.getElementById('prompt-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'prompt-overlay';
  overlay.style.cssText = 'position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:10000;background:white;border:1px solid #ccc;padding:10px;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
  overlay.innerHTML = `
    <textarea id="pe-prompt" rows="4" style="width:100%;"></textarea>
    <button id="pe-refresh" style="background:#eee;">Refresh</button>
    <button id="pe-enhance" style="background:#eee;">Enhance with Gemini</button>
    <textarea id="pe-improved" rows="4" style="width:100%;display:none;"></textarea>
    <button id="pe-accept" style="display:none;background:#eee;">Accept</button>
    <button id="pe-close" style="background:#eee;">Close</button>
    <div id="pe-status" style="font-size:12px;color:green;margin-top:4px;"></div>`;
  document.body.appendChild(overlay);

  const promptArea = overlay.querySelector('#pe-prompt');
  const refreshBtn = overlay.querySelector('#pe-refresh');
  const enhanceBtn = overlay.querySelector('#pe-enhance');
  const improvedArea = overlay.querySelector('#pe-improved');
  const acceptBtn = overlay.querySelector('#pe-accept');
  const closeBtn = overlay.querySelector('#pe-close');
  const status = overlay.querySelector('#pe-status');

  function fetchPrompt() {
    const text = getCurrentPrompt();
    promptArea.value = text.trim();
  }

  fetchPrompt();

  refreshBtn.addEventListener('click', fetchPrompt);

  enhanceBtn.addEventListener('click', async () => {
    const { getApiKey, requestPromptEnhancement } = await import(chrome.runtime.getURL('popup/common.js'));
    const apiKey = await getApiKey();
    if (!apiKey) {
      status.textContent = 'API key required';
      return;
    }
    enhanceBtn.disabled = true;
    enhanceBtn.textContent = '…';
    try {
      const improved = await requestPromptEnhancement(promptArea.value, apiKey);
      improvedArea.value = improved;
      improvedArea.style.display = 'block';
      acceptBtn.style.display = 'inline-block';
    } catch (err) {
      status.textContent = err.message;
    } finally {
      enhanceBtn.disabled = false;
      enhanceBtn.textContent = 'Enhance with Gemini';
    }
  });

  acceptBtn.addEventListener('click', () => {
    const ok = setCurrentPrompt(improvedArea.value);
    if (ok) {
      overlay.remove();
    } else {
      status.textContent = 'Input field not found';
    }
  });

  closeBtn.addEventListener('click', () => overlay.remove());
}
/* global chrome */

function getCurrentPrompt() {
  const field = document.querySelector(
    '#prompt-textarea, div[role="textbox"], textarea[data-testid="prompt-textarea"]'
  );
  return field ? (field.value !== undefined ? field.value : field.innerText) : '';
}

function setCurrentPrompt(text) {
  const field = document.querySelector(
    '#prompt-textarea, div[role="textbox"], textarea[data-testid="prompt-textarea"]'
  );
  if (!field) return false;
  if (field.value !== undefined) {
    field.value = text;
  } else {
    field.innerText = text;
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// Respond to popup requests for getting or setting the ChatGPT prompt
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

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'prompt-overlay';
  overlay.innerHTML = `
    <div class="pe-header">
      ✨ Gemini Prompt Enhancer
      <button class="pe-close-btn" id="pe-close">×</button>
    </div>
    <div class="pe-container">
      <div class="pe-section">
        <label class="pe-label">📝 Current Prompt</label>
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
      showStatus('✅ Prompt loaded', 'success');
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
      const { getApiKey, requestPromptEnhancement } = await import(chrome.runtime.getURL('popup/common.js'));
      const apiKey = await getApiKey();
      
      if (!apiKey) {
        showStatus('❌ API key required. Please set it in the extension popup.', 'error');
        return;
      }

      // Show loading state
      enhanceBtn.disabled = true;
      enhanceBtn.classList.add('loading');
      enhanceBtn.textContent = '🤖 Enhancing...';
      
      const improved = await requestPromptEnhancement(prompt, apiKey);
      
      if (!improved) {
        throw new Error('No enhanced prompt received');
      }

      improvedArea.value = improved;
      enhancedSection.classList.add('show');
      showStatus('✨ Prompt enhanced successfully!', 'success');
      
    } catch (err) {
      showStatus(`❌ ${err.message}`, 'error');
      console.error('Enhancement error:', err);
    } finally {
      enhanceBtn.disabled = false;
      enhanceBtn.classList.remove('loading');
      enhanceBtn.textContent = '🚀 Enhance with Gemini';
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
      showStatus('✅ Prompt replaced successfully!', 'success');
      setTimeout(() => {
        closeOverlay();
      }, 1000);
    } else {
      showStatus('❌ Input field not found', 'error');
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
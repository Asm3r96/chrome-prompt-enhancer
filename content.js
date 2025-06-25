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

/* global chrome */
// Respond to popup requests for getting or setting the ChatGPT prompt
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PROMPT') {
    const field = document.querySelector(
      '#prompt-textarea, div[role="textbox"], textarea[data-testid="prompt-textarea"]'
    );
    const value = field ? (field.value !== undefined ? field.value : field.innerText) : '';
    sendResponse({ prompt: value.trim() });
  } else if (msg.type === 'SET_PROMPT') {
    const field = document.querySelector(
      '#prompt-textarea, div[role="textbox"], textarea[data-testid="prompt-textarea"]'
    );
    if (field) {
      if (field.value !== undefined) {
        field.value = msg.prompt;
      } else {
        field.innerText = msg.prompt;
      }
      field.dispatchEvent(new Event('input', { bubbles: true }));
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
    <button id="pe-refresh">Refresh</button>
    <button id="pe-enhance">Enhance with Gemini</button>
    <textarea id="pe-improved" rows="4" style="width:100%;display:none;"></textarea>
    <button id="pe-accept" style="display:none;">Accept</button>
    <button id="pe-close">Close</button>
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
    chrome.runtime.sendMessage({ type: 'GET_PROMPT' }, res => {
      if (res && typeof res.prompt === 'string') {
        promptArea.value = res.prompt;
      }
    });
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
    chrome.runtime.sendMessage({ type: 'SET_PROMPT', prompt: improvedArea.value }, res => {
      if (res?.ok) {
        overlay.remove();
      } else {
        status.textContent = res?.error || 'Unable to set prompt';
      }
    });
  });

  closeBtn.addEventListener('click', () => overlay.remove());
}

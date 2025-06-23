/* global chrome */
(async () => {
  const { enabled = true } = await chrome.storage.sync.get('enabled');
  if (!enabled) return;

  // Map of hostname => selector for textarea / input
  const TARGETS = {
    // ChatGPT frequently changes its markup. Try a few common selectors
    'chat.openai.com': 'textarea[data-testid="prompt-textarea"], form textarea',

    // Claude uses a dedicated textarea for conversations
    'claude.ai': 'textarea[data-testid="conversation-textarea"], textarea[placeholder*="Claude"]',

    // Gemini exposes a textarea labelled with "message"
    'gemini.google.com': 'textarea[aria-label*="message"]'
  };

  const selector = TARGETS[location.hostname];
  if (!selector) return;

  // Inject observer that waits for the textarea to exist
  function tryInject() {
    const field = document.querySelector(selector);
    if (field && !field.dataset.enhancerApplied) {
      injectButton(field);
      field.dataset.enhancerApplied = 'true';
    }
  }

  // Inject immediately in case the textarea already exists
  tryInject();

  // Observe for future additions as some pages replace the entire body
  const observer = new MutationObserver(tryInject);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  function injectButton(textarea) {
    const btn = document.createElement('button');
    btn.textContent = '✨ Enhance';
    btn.style.cssText = 'margin-left:4px;padding:2px 6px;font-size:12px;cursor:pointer;border-radius:4px;';
    btn.addEventListener('click', async e => {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = '…';
      const prompt = textarea.value;
      chrome.runtime.sendMessage({ type: 'ENHANCE_PROMPT', prompt }, response => {
        if (response?.ok) {
          textarea.value = response.improved;
        } else {
          const err = response?.error || chrome.runtime.lastError?.message || 'unknown';
          alert(`Enhancer error: ${err}`);
        }
        btn.textContent = '✨ Enhance';
        btn.disabled = false;
      });
    });

    // Place the button after the textarea
    textarea.parentElement.appendChild(btn);
  }
})();
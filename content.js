/* global chrome */
(async () => {
  const { enabled = true } = await chrome.storage.sync.get('enabled');
  if (!enabled) return;

  // Map of hostname => selector for textarea / input
  const TARGETS = {
    'chat.openai.com': 'form textarea, form [data-id="root"] textarea',
    'claude.ai': 'textarea[data-testid="conversation-textarea"]',
    'gemini.google.com': 'textarea[aria-label*="Send a message"]'
  };

  const selector = TARGETS[location.hostname];
  if (!selector) return;

  // Inject observer that waits for the textarea to exist
  const observer = new MutationObserver(() => {
    const field = document.querySelector(selector);
    if (field && !field.dataset.enhancerApplied) {
      injectButton(field);
      field.dataset.enhancerApplied = 'true';
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

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
          alert(`Enhancer error: ${response?.error || 'unknown'}`);
        }
        btn.textContent = '✨ Enhance';
        btn.disabled = false;
      });
    });

    // Place the button after the textarea
    textarea.parentElement.appendChild(btn);
  }
})();
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
  }
  return true;
});

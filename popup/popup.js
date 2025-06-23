/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('save');
  const promptArea = document.getElementById('prompt');
  const refreshBtn = document.getElementById('refresh');
  const enhanceBtn = document.getElementById('enhance');
  const improvedArea = document.getElementById('improved');
  const acceptBtn = document.getElementById('accept');
  const status = document.getElementById('status');

  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  apiKeyInput.value = apiKey;

  let currentTab;
  async function fetchPrompt() {
    if (!currentTab) {
      [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    }

    function requestPrompt() {
      chrome.tabs.sendMessage(currentTab.id, { type: 'GET_PROMPT' }, res => {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({ target: { tabId: currentTab.id }, files: ['content.js'] }, () => {
            if (chrome.runtime.lastError) {
              status.textContent = 'Unable to connect to ChatGPT';
            } else {
              chrome.tabs.sendMessage(currentTab.id, { type: 'GET_PROMPT' }, inner => {
                if (inner && typeof inner.prompt === 'string') {
                  promptArea.value = inner.prompt;
                } else {
                  status.textContent = 'Unable to read prompt';
                }
              });
            }
          });
        } else if (res && typeof res.prompt === 'string') {
          promptArea.value = res.prompt;
        } else {
          status.textContent = 'Unable to read prompt';
        }
      });
    }

    requestPrompt();
  }

  await fetchPrompt();

  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ apiKey: apiKeyInput.value.trim() }, () => {
      status.textContent = '✔ Saved';
      setTimeout(() => status.textContent = '', 2000);
    });
  });

  refreshBtn.addEventListener('click', fetchPrompt);

  enhanceBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      status.textContent = 'API key required';
      return;
    }
    enhanceBtn.disabled = true;
    enhanceBtn.textContent = '…';
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: 'Improve the following prompt for clarity, completeness and efficiency.' },
              { text: promptArea.value }
            ]
          }]
        })
      });
      if (!res.ok) throw new Error(`Gemini returned ${res.status}`);
      const data = await res.json();
      const improved = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim() || '';
      improvedArea.value = improved;
      improvedArea.style.display = 'block';
      acceptBtn.style.display = 'block';
    } catch (err) {
      status.textContent = err.message;
    } finally {
      enhanceBtn.disabled = false;
      enhanceBtn.textContent = 'Enhance with Gemini';
    }
  });

  acceptBtn.addEventListener('click', () => {
    chrome.tabs.sendMessage(currentTab.id, { type: 'SET_PROMPT', prompt: improvedArea.value }, res => {
      if (res?.ok) {
        window.close();
      } else {
        status.textContent = res?.error || 'Unable to set prompt';
      }
    });
  });
});

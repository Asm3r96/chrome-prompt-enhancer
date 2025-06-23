/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('save');
  const status = document.getElementById('status');

  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  apiKeyInput.value = apiKey;

  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ apiKey: apiKeyInput.value.trim() }, () => {
      status.textContent = '✔ Saved';
      setTimeout(() => (status.textContent = ''), 2000);
    });
  });
});

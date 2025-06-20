/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  const enabledCheckbox = document.getElementById('enabled');
  const providerSelect = document.getElementById('provider');
  const apiKeyInput = document.getElementById('apiKey');
  const status = document.getElementById('status');

  // Load stored settings
  const { enabled = true, provider = 'openai', apiKey = '' } = await chrome.storage.sync.get(['enabled','provider','apiKey']);
  enabledCheckbox.checked = enabled;
  providerSelect.value = provider;
  apiKeyInput.value = apiKey;

  document.getElementById('save').addEventListener('click', () => {
    chrome.storage.sync.set({
      enabled: enabledCheckbox.checked,
      provider: providerSelect.value,
      apiKey: apiKeyInput.value.trim()
    }, () => {
      status.textContent = '✔ Saved';
      setTimeout(() => status.textContent = '', 2000);
    });
  });
});
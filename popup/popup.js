/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  // Tab elements
  const tabButtons = document.querySelectorAll('.tab-button');
  const mainTab = document.getElementById('mainTab');
  const historyTab = document.getElementById('historyTab');
  const settingsTab = document.getElementById('settingsTab');
  const backToMain = document.getElementById('backToMain');
  const backToMainFromHistory = document.getElementById('backToMainFromHistory');

  // API Selection elements
  const apiProviderSelect = document.getElementById('apiProviderSelect');
  const geminiApiKeyGroup = document.getElementById('geminiApiKeyGroup');
  const openaiApiKeyGroup = document.getElementById('openaiApiKeyGroup');
  const claudeApiKeyGroup = document.getElementById('claudeApiKeyGroup');

  // API Key input elements
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const claudeApiKeyInput = document.getElementById('claudeApiKey');

  // Password toggle buttons and icons

  // Save and Test buttons
  const saveApiKeysBtn = document.getElementById('saveApiKeys');
  const testConnectionBtn = document.getElementById('testConnection');

  // Status elements
  const statusCard = document.getElementById('statusCard');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusMessage = document.getElementById('statusMessage');

  // Model selection elements
  const apiModelGroup = document.getElementById('apiModelGroup');
  const apiModelSelect = document.getElementById('apiModelSelect');
  const customPromptInput = document.getElementById('customPrompt');
  const toneSelect = document.getElementById('toneSelect');
  const lengthSelect = document.getElementById('lengthSelect');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');

  // History elements
  const historySearchInput = document.getElementById('historySearch');
  const enhancementsList = document.getElementById('enhancementsList');
  const noEnhancementsMessage = document.getElementById('noEnhancementsMessage');
  const defaultSettings = {
    customPrompt: '',
    tone: 'neutral',
    length: 'same'
  };

  // Define available models for each API provider
  const apiModels = {
    gemini: {
      'gemini-2.5-pro': 'Gemini 2.5 Pro',
      'gemini-2.5-flash': 'Gemini 2.5 Flash',
      'gemini-2.0-flash': 'Gemini 2.0 Flash',
      'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite',
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-nano': 'Gemini Nano',
    },
    openai: {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    },
    claude: {
      'claude-4-opus': 'Claude 4 Opus',
      'claude-4-sonnet': 'Claude 4 Sonnet',
      'claude-3.7-sonnet': 'Claude 3.7 Sonnet',
      'claude-3.5-sonnet': 'Claude 3.5 Sonnet',
      'claude-3.5-haiku': 'Claude 3.5 Haiku',
      'claude-3-opus-20240229': 'Claude 3 Opus (2024-02-29)',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet (2024-02-29)',
      'claude-3-haiku-20240307': 'Claude 3 Haiku (2024-03-07)',
    }
  };

  // Current tab state
  let currentTab = 'main';

  // Load saved data
  const { selectedApiProvider = 'gemini', selectedApiModel = '', geminiApiKey = '', openaiApiKey = '', claudeApiKey = '', enhancementSettings = defaultSettings } = await chrome.storage.sync.get(['selectedApiProvider', 'selectedApiModel', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey', 'enhancementSettings']);
  
  // Set API keys
  geminiApiKeyInput.value = geminiApiKey;
  openaiApiKeyInput.value = openaiApiKey;
  claudeApiKeyInput.value = claudeApiKey;
  
  // Set enhancement settings
  customPromptInput.value = enhancementSettings.customPrompt || '';
  toneSelect.value = enhancementSettings.tone || 'neutral';
  
  // Set length dropdown
  lengthSelect.value = enhancementSettings.length || 'same';

  // Set selected API provider dropdown
  apiProviderSelect.value = selectedApiProvider;

  // Initialize API key and model visibility based on selected provider
  updateApiKeyAndModelVisibility(selectedApiProvider, selectedApiModel);
  
  // Initialize status based on API key
  updateStatus();

  // TAB SWITCHING FUNCTIONALITY
  function switchToTab(tabId) {
    // Deactivate all tab contents and buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

    // Activate the selected tab content
    document.getElementById(tabId).classList.add('active');

    // Activate the corresponding tab button
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    currentTab = tabId;

    // Load history if switching to history tab
    if (tabId === 'historyTab') {
      loadEnhancements();
    }
  }

  // Event listeners for tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchToTab(button.dataset.tab);
    });
  });

  // Back to main button from settings
  backToMain.addEventListener('click', () => {
    switchToTab('mainTab');
  });

  // Back to main button from history
  backToMainFromHistory.addEventListener('click', () => {
    switchToTab('mainTab');
  });

  // EXISTING FUNCTIONALITY
  // API Key and Model visibility function
  function updateApiKeyAndModelVisibility(provider, model = null) {
    geminiApiKeyGroup.style.display = provider === 'gemini' ? 'block' : 'none';
    openaiApiKeyGroup.style.display = provider === 'openai' ? 'block' : 'none';
    claudeApiKeyGroup.style.display = provider === 'claude' ? 'block' : 'none';

    // Populate and show/hide model dropdown
    apiModelSelect.innerHTML = ''; // Clear previous options
    const models = apiModels[provider];
    if (models) {
      for (const [value, text] of Object.entries(models)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        apiModelSelect.appendChild(option);
      }
      // Set selected model, or default to the first one if not found
      if (model && models[model]) {
        apiModelSelect.value = model;
      } else {
        apiModelSelect.value = Object.keys(models)[0];
      }
      apiModelGroup.style.display = 'block';
    } else {
      apiModelGroup.style.display = 'none';
    }
  }

  // API Provider dropdown change listener
  apiProviderSelect.addEventListener('change', async (event) => {
    const selectedProvider = event.target.value;
    await chrome.storage.sync.set({ selectedApiProvider: selectedProvider });
    // Load the previously selected model for this provider, or default to first
    const { selectedApiModel } = await chrome.storage.sync.get(['selectedApiModel']);
    updateApiKeyAndModelVisibility(selectedProvider, selectedApiModel);
    updateStatus();
  });

  // Model selection change listener
  apiModelSelect.addEventListener('change', async (event) => {
    const selectedModel = event.target.value;
    await chrome.storage.sync.set({ selectedApiModel: selectedModel });
    updateStatus();
  });

  // Save API keys
  saveApiKeysBtn.addEventListener('click', async () => {
    const geminiApiKey = geminiApiKeyInput.value.trim();
    const openaiApiKey = openaiApiKeyInput.value.trim();
    const claudeApiKey = claudeApiKeyInput.value.trim();
    const selectedApiProvider = apiProviderSelect.value;
    const selectedApiModel = apiModelSelect.value;

    // Show loading state
    saveApiKeysBtn.classList.add('loading');
    saveApiKeysBtn.disabled = true;

    try {
      await chrome.storage.sync.set({ geminiApiKey, openaiApiKey, claudeApiKey, selectedApiProvider, selectedApiModel });
      showStatus('success', 'API Keys & Model Saved', 'Your API keys and selected model have been saved successfully');
      
      // Auto-test the key after saving
      setTimeout(() => {
        if (saveApiKeysBtn) {
          saveApiKeysBtn.classList.remove('loading');
          saveApiKeysBtn.disabled = false;
        }
        testConnection();
      }, 1000);
      
    } catch (error) {
      showStatus('error', 'Save Failed', 'Failed to save API keys and model. Please try again.');
      saveApiKeysBtn.classList.remove('loading');
      saveApiKeysBtn.disabled = false;
    }
  });

  // Save enhancement settings
  saveSettingsBtn.addEventListener('click', async () => {
    const settings = {
      customPrompt: customPromptInput.value.trim(),
      tone: toneSelect.value,
      length: lengthSelect.value
    };

    // Show loading state
    saveSettingsBtn.classList.add('loading');
    saveSettingsBtn.disabled = true;

    try {
      await chrome.storage.sync.set({ enhancementSettings: settings });
      showStatus('success', 'Settings Saved', 'Your enhancement preferences have been saved');
      
      setTimeout(() => {
        saveSettingsBtn.classList.remove('loading');
        saveSettingsBtn.disabled = false;
      }, 1000);
      
    } catch (error) {
      showStatus('error', 'Save Failed', 'Failed to save settings. Please try again.');
      saveSettingsBtn.classList.remove('loading');
      saveSettingsBtn.disabled = false;
    }
  });

  // Reset settings to default
  resetSettingsBtn.addEventListener('click', async () => {
    customPromptInput.value = defaultSettings.customPrompt;
    toneSelect.value = defaultSettings.tone;
    lengthSelect.value = defaultSettings.length;

    // Save the default settings
    try {
      await chrome.storage.sync.set({ enhancementSettings: defaultSettings });
      showStatus('success', 'Settings Reset', 'Settings have been reset to default values');
    } catch (error) {
      showStatus('error', 'Reset Failed', 'Failed to reset settings. Please try again.');
    }
  });

  // Test API key connection
  testConnectionBtn.addEventListener('click', testConnection);

  // Auto-save on input change (debounced)
  let saveTimeout;
  [geminiApiKeyInput, openaiApiKeyInput, claudeApiKeyInput].forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      updateStatus();
      
      // Auto-save after 2 seconds of no typing
      saveTimeout = setTimeout(() => {
        const geminiApiKey = geminiApiKeyInput.value.trim();
        const openaiApiKey = openaiApiKeyInput.value.trim();
        const claudeApiKey = claudeApiKeyInput.value.trim();
        chrome.storage.sync.set({ geminiApiKey, openaiApiKey, claudeApiKey });
      }, 2000);
    });
  });

  // Auto-save enhancement settings
  let settingsTimeout;
  function autoSaveSettings() {
    clearTimeout(settingsTimeout);
    settingsTimeout = setTimeout(async () => {
      const settings = {
        customPrompt: customPromptInput.value.trim(),
        tone: toneSelect.value,
        length: document.querySelector('input[name="length"]:checked')?.value || 'same'
      };
      
      try {
        await chrome.storage.sync.set({ enhancementSettings: settings });
        // Update main tab status when settings change
        updateStatus();
      } catch (error) {
        console.log('Auto-save failed:', error);
      }
    }, 1500);
  }

  // Add auto-save listeners
  customPromptInput.addEventListener('input', autoSaveSettings);
  toneSelect.addEventListener('change', autoSaveSettings);
  lengthRadios.forEach(radio => {
    radio.addEventListener('change', autoSaveSettings);
  });

  // Test connection function
  async function testConnection() {
    const { selectedApiProvider, selectedApiModel, geminiApiKey, openaiApiKey, claudeApiKey } = await chrome.storage.sync.get(['selectedApiProvider', 'selectedApiModel', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey']);
    
    let apiKey;
    let apiUrl;
    let headers = { 'Content-Type': 'application/json' };
    let body;
    let testMessage;

    switch (selectedApiProvider) {
      case 'gemini':
        apiKey = geminiApiKey;
        if (!apiKey) {
          showStatus('error', 'No Gemini API Key', 'Please enter your Gemini API key first');
          return;
        }
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedApiModel || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`;
        body = JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Hello' }]
          }]
        });
        testMessage = `Verifying your Gemini API key with model ${selectedApiModel || 'gemini-2.5-flash'}...`;
        break;
      case 'openai':
        apiKey = openaiApiKey;
        if (!apiKey) {
          showStatus('error', 'No OpenAI API Key', 'Please enter your OpenAI API key first');
          return;
        }
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = JSON.stringify({
          model: selectedApiModel || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }]
        });
        testMessage = `Verifying your OpenAI API key with model ${selectedApiModel || 'gpt-3.5-turbo'}...`;
        break;
      case 'claude':
        apiKey = claudeApiKey;
        if (!apiKey) {
          showStatus('error', 'No Claude API Key', 'Please enter your Anthropic Claude API key first');
          return;
        }
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          model: selectedApiModel || 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hello' }]
        });
        testMessage = `Verifying your Anthropic Claude API key with model ${selectedApiModel || 'claude-3-haiku-20240307'}...`;
        break;
      default:
        showStatus('error', 'Unknown API Provider', 'Please select an API provider.');
        return;
    }

    // Show loading state
    testConnectionBtn.classList.add('loading');
    testConnectionBtn.disabled = true;
    showStatus('info', 'Testing Connection', testMessage);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (response.ok) {
        showStatus('success', 'Connection Successful', `Your ${selectedApiProvider} API key is working correctly with model ${selectedApiModel || 'default'}!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
        showStatus('error', 'Connection Failed', `${selectedApiProvider} API key test failed with model ${selectedApiModel || 'default'}: ${errorMessage}`);
      }
    } catch (error) {
      showStatus('error', 'Connection Error', `Failed to connect to ${selectedApiProvider} API with model ${selectedApiModel || 'default'}. Check your internet connection.`);
      console.error(`${selectedApiProvider} API test error:`, error);
    } finally {
      testConnectionBtn.classList.remove('loading');
      testConnectionBtn.disabled = false;
    }
  }

  // Update status based on current state
  async function updateStatus() {
    const { selectedApiProvider, selectedApiModel, geminiApiKey, openaiApiKey, claudeApiKey, enhancementSettings } = await chrome.storage.sync.get(['selectedApiProvider', 'selectedApiModel', 'geminiApiKey', 'openaiApiKey', 'claudeApiKey', 'enhancementSettings']);
    
    let currentApiKey;
    let apiName;

    switch (selectedApiProvider) {
      case 'gemini':
        currentApiKey = geminiApiKey;
        apiName = 'Gemini';
        break;
      case 'openai':
        currentApiKey = openaiApiKey;
        apiName = 'OpenAI';
        break;
      case 'claude':
        currentApiKey = claudeApiKey;
        apiName = 'Anthropic Claude';
        break;
      default:
        showStatus('info', 'Ready to Configure', 'Please select an API provider and configure your API key');
        return;
    }

    if (!currentApiKey) {
      showStatus('info', 'Ready to Configure', `Click the gear icon to configure your ${apiName} API key`);
    } else {
      // Check if settings are customized
      const hasCustomSettings = enhancementSettings.customPrompt.trim() || 
                                enhancementSettings.tone !== 'neutral' || 
                                enhancementSettings.length !== 'same';
      
      if (hasCustomSettings) {
        showStatus('success', `Ready with Custom Settings (${apiName} - ${selectedApiModel || 'default'})`, `API configured with custom enhancement settings for ${apiName} using model ${selectedApiModel || 'default'}`);
      } else {
        showStatus('success', `Ready to Use (${apiName} - ${selectedApiModel || 'default'})`, `Press Alt+A on any AI platform to start enhancing with ${apiName} using model ${selectedApiModel || 'default'}`);
      }
    }
  }

  // Show status function
  function showStatus(type, title, message) {
    // Remove existing status classes
    statusCard.className = 'status-card';
    
    // Add new status class
    if (type) {
      statusCard.classList.add(type);
    }

    // Update content
    statusTitle.textContent = title;
    statusMessage.textContent = message;

    // Update icon based on type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    statusIcon.textContent = icons[type] || 'ℹ️';

    // Add animation
    statusCard.style.animation = 'none';
    statusCard.offsetHeight; // Trigger reflow
    statusCard.style.animation = 'fadeInUp 0.3s ease-out';
  }

  // History functions
  async function loadEnhancements() {
    const { enhancements } = await chrome.storage.local.get({ enhancements: [] });
    displayEnhancements(enhancements);
  }

  function displayEnhancements(enhancements) {
    enhancementsList.innerHTML = ''; // Clear current list
    if (enhancements.length === 0) {
      noEnhancementsMessage.style.display = 'block';
      return;
    }
    noEnhancementsMessage.style.display = 'none';

    enhancements.forEach(enhancement => {
      const enhancementCard = document.createElement('div');
      enhancementCard.classList.add('enhancement-card');
      enhancementCard.innerHTML = `
        <div class="enhancement-header">
          <span class="enhancement-date">${new Date(enhancement.timestamp).toLocaleString()}</span>
          <span class="enhancement-meta">${enhancement.apiProvider} / ${enhancement.apiModel}</span>
        </div>
        <div class="enhancement-content">
          <div class="enhancement-prompt">
            <strong>Original:</strong>
            <textarea readonly>${enhancement.originalPrompt}</textarea>
          </div>
          <div class="enhancement-prompt">
            <strong>Enhanced:</strong>
            <textarea readonly>${enhancement.enhancedPrompt}</textarea>
          </div>
        </div>
        <div class="enhancement-actions">
          <button class="copy-original-btn" data-text="${enhancement.originalPrompt.replace(/"/g, '&quot;')}">Copy Original</button>
          <button class="copy-enhanced-btn" data-text="${enhancement.enhancedPrompt.replace(/"/g, '&quot;')}">Copy Enhanced</button>
        </div>
      `;
      enhancementsList.appendChild(enhancementCard);
    });

    // Add copy functionality
    enhancementsList.querySelectorAll('.copy-original-btn, .copy-enhanced-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const textToCopy = event.target.dataset.text;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 1500);
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
      });
    });
  }

  // History search functionality
  historySearchInput.addEventListener('input', async (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const { enhancements } = await chrome.storage.local.get({ enhancements: [] });
    const filteredEnhancements = enhancements.filter(enhancement => 
      enhancement.originalPrompt.toLowerCase().includes(searchTerm) ||
      enhancement.enhancedPrompt.toLowerCase().includes(searchTerm) ||
      enhancement.apiProvider.toLowerCase().includes(searchTerm) ||
      enhancement.apiModel.toLowerCase().includes(searchTerm)
    );
    displayEnhancements(filteredEnhancements);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape to go back to main tab
    if (e.key === 'Escape' && currentTab === 'settingsTab') {
      e.preventDefault();
      switchToTab('mainTab');
      return;
    }

    // Only handle other shortcuts when in settings tab
    if (currentTab !== 'settingsTab') return;

    // Ctrl/Cmd + S to save API key
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveApiKeysBtn.click();
    }
    
    // Ctrl/Cmd + T to test
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      testConnectionBtn.click();
    }

    // Ctrl/Cmd + Shift + S to save settings
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveSettingsBtn.click();
    }
  });

  // Auto-focus on API key input if empty and in settings tab
  // This logic needs to be updated to consider the selected API provider
  // For now, we'll remove it to avoid unexpected behavior.
  // if (!apiKey && currentTab === 'settings') {
  //   apiKeyInput.focus();
  // }

  // Add helpful tooltips
  saveApiKeysBtn.title = 'Save API keys (Ctrl+S)';
  testConnectionBtn.title = 'Test API connection (Ctrl+T)';
  saveSettingsBtn.title = 'Save enhancement settings (Ctrl+Shift+S)';
  resetSettingsBtn.title = 'Reset settings to default';
  backToMain.title = 'Back to main screen';
  backToMainFromHistory.title = 'Back to main screen';

  // Initialize with main tab
  switchToTab('mainTab');
});
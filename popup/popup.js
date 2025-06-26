/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  // Tab elements
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsIcon = document.getElementById('settingsIcon');
  const backToMain = document.getElementById('backToMain');
  const mainTab = document.getElementById('mainTab');
  const settingsTab = document.getElementById('settingsTab');

  // Existing elements
  const apiKeyInput = document.getElementById('apiKey');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const saveBtn = document.getElementById('save');
  const testBtn = document.getElementById('testKey');
  const statusCard = document.getElementById('statusCard');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusMessage = document.getElementById('statusMessage');

  // Enhancement settings elements
  const customPromptInput = document.getElementById('customPrompt');
  const toneSelect = document.getElementById('toneSelect');
  const lengthRadios = document.querySelectorAll('input[name="length"]');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');

  // Default enhancement settings
  const defaultSettings = {
    customPrompt: '',
    tone: 'neutral',
    length: 'same'
  };

  // Current tab state
  let currentTab = 'main';

  // Load saved data
  const { apiKey = '', enhancementSettings = defaultSettings } = await chrome.storage.sync.get(['apiKey', 'enhancementSettings']);
  
  // Set API key
  apiKeyInput.value = apiKey;
  
  // Set enhancement settings
  customPromptInput.value = enhancementSettings.customPrompt || '';
  toneSelect.value = enhancementSettings.tone || 'neutral';
  
  // Set length radio
  const selectedLengthRadio = document.querySelector(`input[name="length"][value="${enhancementSettings.length || 'same'}"]`);
  if (selectedLengthRadio) {
    selectedLengthRadio.checked = true;
  }
  
  // Initialize status based on API key
  updateStatus();

  // TAB SWITCHING FUNCTIONALITY
  function switchToTab(tabName) {
    if (currentTab === tabName) return;

    const fromTab = currentTab === 'main' ? mainTab : settingsTab;
    const toTab = tabName === 'main' ? mainTab : settingsTab;

    // Slide out current tab
    fromTab.classList.add('sliding-out');
    fromTab.classList.remove('active');

    // Update settings button state
    if (tabName === 'settings') {
      settingsToggle.classList.add('active');
      settingsIcon.textContent = '✕';
    } else {
      settingsToggle.classList.remove('active');
      settingsIcon.textContent = '⚙️';
    }

    // Slide in new tab after a short delay
    setTimeout(() => {
      fromTab.classList.remove('sliding-out');
      toTab.classList.add('active');
      currentTab = tabName;
    }, 150);
  }

  // Settings toggle button
  settingsToggle.addEventListener('click', () => {
    if (currentTab === 'main') {
      switchToTab('settings');
    } else {
      switchToTab('main');
    }
  });

  // Back to main button
  backToMain.addEventListener('click', () => {
    switchToTab('main');
  });

  // EXISTING FUNCTIONALITY
  // Password toggle functionality
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    eyeIcon.textContent = isPassword ? '🙈' : '👁️';
  });

  // Save API key
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('error', 'Invalid API Key', 'Please enter a valid Gemini API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      showStatus('warning', 'Check API Key', 'Make sure you\'re using a valid Gemini API key (starts with "AIza")');
      return;
    }

    // Show loading state
    saveBtn.classList.add('loading');
    saveBtn.disabled = true;

    try {
      await chrome.storage.sync.set({ apiKey });
      showStatus('success', 'API Key Saved', 'Your API key has been saved successfully');
      
      // Auto-test the key after saving
      setTimeout(() => {
        if (saveBtn) {
          saveBtn.classList.remove('loading');
          saveBtn.disabled = false;
        }
        testConnection();
      }, 1000);
      
    } catch (error) {
      showStatus('error', 'Save Failed', 'Failed to save API key. Please try again.');
      saveBtn.classList.remove('loading');
      saveBtn.disabled = false;
    }
  });

  // Save enhancement settings
  saveSettingsBtn.addEventListener('click', async () => {
    const settings = {
      customPrompt: customPromptInput.value.trim(),
      tone: toneSelect.value,
      length: document.querySelector('input[name="length"]:checked')?.value || 'same'
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
    
    const defaultLengthRadio = document.querySelector(`input[name="length"][value="${defaultSettings.length}"]`);
    if (defaultLengthRadio) {
      defaultLengthRadio.checked = true;
    }

    // Save the default settings
    try {
      await chrome.storage.sync.set({ enhancementSettings: defaultSettings });
      showStatus('success', 'Settings Reset', 'Settings have been reset to default values');
    } catch (error) {
      showStatus('error', 'Reset Failed', 'Failed to reset settings. Please try again.');
    }
  });

  // Test API key connection
  testBtn.addEventListener('click', testConnection);

  // Auto-save on input change (debounced)
  let saveTimeout;
  apiKeyInput.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    updateStatus();
    
    // Auto-save after 2 seconds of no typing
    saveTimeout = setTimeout(() => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey && apiKey !== chrome.storage.sync.get('apiKey')) {
        chrome.storage.sync.set({ apiKey });
      }
    }, 2000);
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
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('error', 'No API Key', 'Please enter your API key first');
      return;
    }

    // Show loading state
    testBtn.classList.add('loading');
    testBtn.disabled = true;
    showStatus('info', 'Testing Connection', 'Verifying your API key with Gemini...');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: 'Hello' }]
            }]
          })
        }
      );

      if (response.ok) {
        showStatus('success', 'Connection Successful', 'Your API key is working correctly!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        showStatus('error', 'Connection Failed', `API key test failed: ${errorMessage}`);
      }
    } catch (error) {
      showStatus('error', 'Connection Error', 'Failed to connect to Gemini API. Check your internet connection.');
      console.error('API test error:', error);
    } finally {
      testBtn.classList.remove('loading');
      testBtn.disabled = false;
    }
  }

  // Update status based on current state
  function updateStatus() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('info', 'Ready to Configure', 'Click the gear icon to configure your API key');
    } else if (!apiKey.startsWith('AIza')) {
      showStatus('warning', 'Check API Key', 'Make sure you\'re using a valid Gemini API key');
    } else {
      // Check if settings are customized
      const hasCustomSettings = customPromptInput.value.trim() || 
                               toneSelect.value !== 'neutral' || 
                               document.querySelector('input[name="length"]:checked')?.value !== 'same';
      
      if (hasCustomSettings) {
        showStatus('success', 'Ready with Custom Settings', 'API configured with custom enhancement settings');
      } else {
        showStatus('success', 'Ready to Use', 'Press Alt+A on any AI platform to start enhancing');
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

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape to go back to main tab
    if (e.key === 'Escape' && currentTab === 'settings') {
      e.preventDefault();
      switchToTab('main');
      return;
    }

    // Only handle other shortcuts when in settings tab
    if (currentTab !== 'settings') return;

    // Ctrl/Cmd + S to save API key
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveBtn.click();
    }
    
    // Ctrl/Cmd + T to test
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      testBtn.click();
    }

    // Ctrl/Cmd + Shift + S to save settings
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveSettingsBtn.click();
    }
  });

  // Auto-focus on API key input if empty and in settings tab
  if (!apiKey && currentTab === 'settings') {
    apiKeyInput.focus();
  }

  // Add helpful tooltips
  saveBtn.title = 'Save API key (Ctrl+S)';
  testBtn.title = 'Test API connection (Ctrl+T)';
  saveSettingsBtn.title = 'Save enhancement settings (Ctrl+Shift+S)';
  resetSettingsBtn.title = 'Reset settings to default';
  togglePasswordBtn.title = 'Toggle password visibility';
  settingsToggle.title = 'Settings (Escape to close)';
  backToMain.title = 'Back to main screen';

  // Initialize with main tab
  updateStatus();
});
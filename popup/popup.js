/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const apiKeyInput = document.getElementById('apiKey');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const saveBtn = document.getElementById('save');
  const testBtn = document.getElementById('testKey');
  const statusCard = document.getElementById('statusCard');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusMessage = document.getElementById('statusMessage');

  // Load saved API key
  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  apiKeyInput.value = apiKey;
  
  // Initialize status based on API key
  updateStatus();

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
      showStatus('info', 'Ready to Configure', 'Please enter your Gemini API key to get started');
    } else if (!apiKey.startsWith('AIza')) {
      showStatus('warning', 'Check API Key', 'Make sure you\'re using a valid Gemini API key');
    } else {
      showStatus('success', 'API Key Configured', 'Press Ctrl+Shift+E on ChatGPT, Claude, or Gemini to start enhancing prompts');
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
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveBtn.click();
    }
    
    // Ctrl/Cmd + T to test
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      testBtn.click();
    }
  });

  // Auto-focus on API key input if empty
  if (!apiKey) {
    apiKeyInput.focus();
  }

  // Add helpful tooltips
  saveBtn.title = 'Save API key (Ctrl+S)';
  testBtn.title = 'Test API connection (Ctrl+T)';
  togglePasswordBtn.title = 'Toggle password visibility';
});